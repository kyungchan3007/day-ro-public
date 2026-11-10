import Link from "next/link";

import { DASHBOARD_RANGES, type DashboardRange } from "@/features/analytics";

interface DashboardShellProps {
  range?: DashboardRange;
  meta?: React.ReactNode;
  children: React.ReactNode;
}

/** 어드민 공통 틀: 제목 · 기간 전환 · 본문 */
export function DashboardShell({ range, meta, children }: DashboardShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-title-lg leading-7 font-bold text-text-strong">Dayro 어드민</h1>
          {meta ? <p className="text-control leading-5 text-text-muted">{meta}</p> : null}
        </div>
        {range ? <RangeTabs current={range} /> : null}
      </header>
      {children}
    </main>
  );
}

function RangeTabs({ current }: { current: DashboardRange }) {
  return (
    <nav aria-label="조회 기간" className="flex rounded-base border border-border bg-surface p-1">
      {DASHBOARD_RANGES.map((range) => {
        const active = range === current;
        return (
          <Link
            key={range}
            href={`/?range=${range}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-sm px-3 py-1.5 text-control leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              active ? "bg-primary text-on-primary" : "text-text-secondary hover:bg-surface-subtle"
            }`}
          >
            최근 {range}일
          </Link>
        );
      })}
    </nav>
  );
}
