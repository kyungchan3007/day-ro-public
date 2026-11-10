import "server-only";
import * as z from "zod/mini";

export type AccessResult =
  | { ok: true; email: string | null }
  | { ok: false; reason: "missing_config" | "missing_token" | "invalid_token" };

type Dependencies = { env: () => Record<string, string | undefined>; fetch: typeof fetch; now: () => number };
const jwksSchema = z.object({ keys: z.array(z.object({
  kty: z.literal("RSA"), kid: z.string(), n: z.string(), e: z.string(),
  alg: z.optional(z.literal("RS256")), use: z.optional(z.literal("sig")),
})) });
const claimsSchema = z.object({
  aud: z.union([z.string(), z.array(z.string())]), iss: z.string(),
  exp: z.number(), nbf: z.optional(z.number()), email: z.optional(z.unknown()),
});
const decode = (part: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(part)) throw new Error("encoding");
  return Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
};

export function createAccessVerifier(deps: Dependencies) {
  // Cache belongs to a verifier/Worker isolate and is scoped to the configured issuer.
  let cache: { issuer: string; expires: number; keys: z.infer<typeof jwksSchema>["keys"] } | undefined;
  let pending: { issuer: string; promise: Promise<z.infer<typeof jwksSchema>["keys"]> } | undefined;
  async function keys(issuer: string, refresh = false) {
    if (!refresh && cache?.issuer === issuer && cache.expires > deps.now()) return cache.keys;
    if (pending?.issuer === issuer) return pending.promise;
    const promise = (async () => {
      const response = await deps.fetch(`${issuer}/cdn-cgi/access/certs`, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error("jwks_http");
      const result = jwksSchema.parse(await response.json()).keys;
      cache = { issuer, keys: result, expires: deps.now() + 5 * 60_000 };
      return result;
    })();
    pending = { issuer, promise };
    try { return await promise; } finally { if (pending?.promise === promise) pending = undefined; }
  }
  return async (headers: Headers): Promise<AccessResult> => {
    const env = deps.env();
    if (env.NODE_ENV === "development" && env.ADMIN_ACCESS_DEV_BYPASS === "1") return { ok: true, email: null };
    const team = env.CF_ACCESS_TEAM_DOMAIN?.trim();
    const audience = env.CF_ACCESS_AUD?.trim();
    if (!team || !audience) return { ok: false, reason: "missing_config" };
    const token = headers.get("Cf-Access-Jwt-Assertion");
    if (!token) return { ok: false, reason: "missing_token" };
    try {
      const url = new URL(team.startsWith("https://") ? team : `https://example.invalid}`);
      if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/") throw new Error("issuer_config");
      const issuer = url.origin;
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("jwt_format");
      const [head, body, signature] = parts;
      const header = z.object({ alg: z.literal("RS256"), kid: z.string().check(z.minLength(1)), crit: z.optional(z.never()) }).parse(JSON.parse(new TextDecoder().decode(decode(head))));
      const claims = claimsSchema.parse(JSON.parse(new TextDecoder().decode(decode(body))));
      const now = deps.now() / 1000;
      if (claims.iss !== issuer || !(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(audience) || claims.exp <= now - 30 || (claims.nbf !== undefined && claims.nbf > now + 30)) throw new Error("claims");
      let jwk = (await keys(issuer)).find(key => key.kid === header.kid);
      if (!jwk) jwk = (await keys(issuer, true)).find(key => key.kid === header.kid);
      if (!jwk) throw new Error("kid");
      const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
      if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decode(signature), new TextEncoder().encode(`${head}.${body}`))) throw new Error("signature");
      return { ok: true, email: typeof claims.email === "string" ? claims.email : null };
    } catch {
      return { ok: false, reason: "invalid_token" };
    }
  };
}
const verify = createAccessVerifier({ env: () => process.env, fetch: (...args) => fetch(...args), now: Date.now });
export async function verifyAccessRequest(headers: Headers): Promise<AccessResult> {
  return verify(headers);
}
