import { headers } from "next/headers";

import { verifyAccessRequest } from "@/features/access/server";
import { parseDashboardRange } from "@/features/analytics";
import { getDashboard } from "@/features/analytics/server";
import { Dashboard, DashboardNotice } from "@/widgets/dashboard";

// 요청마다 Access 검증 · GA4 조회를 한다(정적 생성 · 캐시 금지).
export const dynamic = "force-dynamic";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Access 검증을 데이터 조회보다 먼저 한다. 실패하면 GA4 를 부르지 않는다.
  const access = await verifyAccessRequest(await headers());
  if (!access.ok) {
    return <DashboardNotice kind="forbidden" />;
  }

  const { range: rawRange } = await searchParams;
  const range = parseDashboardRange(Array.isArray(rawRange) ? rawRange[0] : rawRange);
  const result = await getDashboard(range);

  if (!result.ok) {
    return <DashboardNotice kind={result.reason} range={range} />;
  }
  return <Dashboard data={result.data} viewerEmail={access.email} />;
}
