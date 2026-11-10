import type { DashboardTotals } from "@/features/analytics";

import { formatCount } from "./format";

interface KpiTilesProps {
  realtimeActiveUsers: number | null;
  totals: DashboardTotals;
  range: number;
}

export function KpiTiles({ realtimeActiveUsers, totals, range }: KpiTilesProps) {
  const tiles = [
    { label: "지금 접속 중", hint: "최근 30분", value: realtimeActiveUsers === null ? "-" : formatCount(realtimeActiveUsers) },
    { label: "활성 사용자", hint: `최근 ${range}일`, value: formatCount(totals.activeUsers) },
    { label: "세션", hint: `최근 ${range}일`, value: formatCount(totals.sessions) },
    { label: "페이지뷰", hint: `최근 ${range}일`, value: formatCount(totals.screenPageViews) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4">
          <dt className="text-control leading-5 text-text-secondary">
            {tile.label}
            <span className="ml-1 text-meta leading-4 text-text-muted">{tile.hint}</span>
          </dt>
          <dd className="text-display leading-8 font-bold tabular-nums text-text-strong">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
