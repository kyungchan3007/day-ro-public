import "server-only";
import * as z from "zod/mini";
import type { DashboardRange, DashboardResult } from "../model/types";

type Dependencies = { env: () => Record<string, string | undefined>; fetch: typeof fetch; now: () => number };
const accountSchema = z.object({ client_email: z.email(), private_key: z.string().check(z.regex(/^-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----\s*$/)) }); // gitleaks:allow — 서비스 계정 키 형식 검사 정규식(실제 키 아님)
const tokenSchema = z.object({ access_token: z.string().check(z.minLength(1)), expires_in: z.number().check(z.positive()), token_type: z.literal("Bearer") });
const countSchema = z.pipe(z.pipe(z.string().check(z.regex(/^\d+$/)), z.transform(Number)), z.int().check(z.nonnegative(), z.maximum(Number.MAX_SAFE_INTEGER)));
const metricValue = z.object({ value: countSchema });
const dimensionValue = z.object({ value: z.string() });
const TOKEN_URL = "https://example.invalid";
const EVENTS = ["course_generated", "course_saved", "course_shared"] as const;
const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const encodeJson = (value: unknown) => encode(new TextEncoder().encode(JSON.stringify(value)));

// Validate both the header contract and each row before interpreting positions.
function reportSchema(metrics: readonly string[], dimensions: readonly string[] = []) {
  return z.object({
    metricHeaders: z.array(z.object({ name: z.string(), type: z.literal("TYPE_INTEGER") })).check(z.refine(headers => headers.length === metrics.length && headers.every((h, i) => h.name === metrics[i]))),
    dimensionHeaders: z._default(z.array(z.object({ name: z.string() })), []).check(z.refine(headers => headers.length === dimensions.length && headers.every((h, i) => h.name === dimensions[i]))),
    rows: z._default(z.array(z.object({
      metricValues: z.array(metricValue).check(z.length(metrics.length)),
      dimensionValues: z._default(z.array(dimensionValue), []).check(z.refine(values => values.length === dimensions.length)),
    })), []).check(z.refine(rows => dimensions.length > 0 || rows.length <= 1)),
  });
}
const totalsSchema = reportSchema(["activeUsers", "sessions", "screenPageViews"]);
const pagesSchema = reportSchema(["screenPageViews", "activeUsers"], ["pagePath"]);
const eventsSchema = reportSchema(["eventCount"], ["eventName"]);
const viewsSchema = reportSchema(["eventCount"]);
const realtimeSchema = reportSchema(["activeUsers"]);

export function createDashboardLoader(deps: Dependencies) {
  let cached: { identity: string; token: string; expires: number } | undefined;
  let pending: { identity: string; promise: Promise<string> } | undefined;
  async function request(url: string, init: RequestInit) {
    const response = await deps.fetch(url, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      // Never log response bodies, credentials, URLs, or caught error objects.
      console.error("admin_analytics_http", response.status);
      throw new Error("upstream_http");
    }
    return response.json();
  }
  async function accessToken(account: z.infer<typeof accountSchema>) {
    const identity = JSON.stringify(account);
    if (cached?.identity === identity && cached.expires > deps.now()) return cached.token;
    if (pending?.identity === identity) return pending.promise;
    const promise = (async () => {
      const startedAt = deps.now();
      const seconds = Math.floor(startedAt / 1000);
      const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
      const bytes = Uint8Array.from(atob(pem), char => char.charCodeAt(0));
      const key = await crypto.subtle.importKey("pkcs8", bytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
      const unsigned = `${encodeJson({ alg: "RS256", typ: "JWT" })}.${encodeJson({ iss: account.client_email, scope: "https://example.invalid", aud: TOKEN_URL, iat: seconds, exp: seconds + 3600 })}`;
      const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
      const token = tokenSchema.parse(await request(TOKEN_URL, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${encode(new Uint8Array(signature))}` }).toString(),
      }));
      cached = { identity, token: token.access_token, expires: startedAt + token.expires_in * 1000 - 60_000 };
      return token.access_token;
    })();
    pending = { identity, promise };
    try { return await promise; } finally { if (pending?.promise === promise) pending = undefined; }
  }
  return async (range: DashboardRange): Promise<DashboardResult> => {
    const env = deps.env();
    let account: z.infer<typeof accountSchema>;
    const property = env.GA4_PROPERTY_ID?.trim();
    try {
      if (!property || !/^\d+$/.test(property) || !env.GA4_SERVICE_ACCOUNT_JSON) return { ok: false, reason: "not_configured" };
      account = accountSchema.parse(JSON.parse(env.GA4_SERVICE_ACCOUNT_JSON));
    } catch { return { ok: false, reason: "not_configured" }; }
    try {
      const token = await accessToken(account);
      const base = `https://example.invalid}`;
      const post = (method: string, body: unknown) => request(`${base}:${method}`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const dateRanges = [{ startDate: `${range}daysAgo`, endDate: "yesterday" }];
      const metrics = (...names: string[]) => names.map(name => ({ name }));
      const reports = [
        { dateRanges, metrics: metrics("activeUsers", "sessions", "screenPageViews") },
        { dateRanges, dimensions: [{ name: "pagePath" }], metrics: metrics("screenPageViews", "activeUsers"), orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: "10" },
        { dateRanges, dimensions: [{ name: "eventName" }], metrics: metrics("eventCount"), dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: EVENTS, caseSensitive: true } } } },
        { dateRanges, metrics: metrics("eventCount"), dimensionFilter: { andGroup: { expressions: [
          { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view", caseSensitive: true } } },
          { filter: { fieldName: "pagePath", inListFilter: { values: ["/course/new", "/course/new/"], caseSensitive: true } } },
        ] } } },
      ];
      const [batch, realtime] = await Promise.all([
        post("batchRunReports", { requests: reports }).then(value => z.object({ reports: z.tuple([totalsSchema, pagesSchema, eventsSchema, viewsSchema]) }).parse(value)),
        // Omitting minuteRanges uses GA4's last-30-minutes default without a minuteRange dimension.
        post("runRealtimeReport", { metrics: metrics("activeUsers") })
          .then(value => realtimeSchema.parse(value).rows.reduce((sum, row) => sum + row.metricValues[0].value, 0))
          .catch(() => null),
      ]);
      const [totals, pages, events, views] = batch.reports;
      const totalValues = totals.rows[0]?.metricValues.map(value => value.value) ?? [0, 0, 0];
      const counts = new Map(events.rows.map(row => [row.dimensionValues[0].value, row.metricValues[0].value]));
      return { ok: true, data: {
        range, realtimeActiveUsers: realtime,
        totals: { activeUsers: totalValues[0], sessions: totalValues[1], screenPageViews: totalValues[2] },
        topPages: pages.rows.map(row => ({ path: row.dimensionValues[0].value, views: row.metricValues[0].value, activeUsers: row.metricValues[1].value })).sort((a, b) => b.views - a.views).slice(0, 10),
        courseSteps: [
          { key: "course_new_view", label: "코스 만들기 화면 진입", count: views.rows[0]?.metricValues[0].value ?? 0 },
          { key: "course_generated", label: "코스 생성", count: counts.get("course_generated") ?? 0 },
          { key: "course_saved", label: "코스 저장", count: counts.get("course_saved") ?? 0 },
          { key: "course_shared", label: "코스 공유", count: counts.get("course_shared") ?? 0 },
        ], generatedAt: new Date(deps.now()).toISOString(),
      } };
    } catch {
      return { ok: false, reason: "upstream_error" };
    }
  };
}
const load = createDashboardLoader({ env: () => process.env, fetch: (...args) => fetch(...args), now: Date.now });
export async function getDashboard(range: DashboardRange): Promise<DashboardResult> {
  return load(range);
}
