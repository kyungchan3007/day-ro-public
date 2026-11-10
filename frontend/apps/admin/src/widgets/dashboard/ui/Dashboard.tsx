import type { DashboardViewModel } from "@/features/analytics";

import { CourseStepList } from "./CourseStepList";
import { DashboardShell } from "./DashboardShell";
import { formatGeneratedAt } from "./format";
import { KpiTiles } from "./KpiTiles";
import { Section } from "./Section";
import { TopPagesTable } from "./TopPagesTable";

interface DashboardProps {
  data: DashboardViewModel;
  viewerEmail: string | null;
}

export function Dashboard({ data, viewerEmail }: DashboardProps) {
  const meta = [formatGeneratedAt(data.generatedAt), viewerEmail].filter(Boolean).join(" · ");

  return (
    <DashboardShell range={data.range} meta={meta}>
      <p className="text-meta leading-4 text-text-muted">
        GA4 속성 시간대 기준 · 어제까지 집계(오늘은 수집 지연으로 제외) · 실시간만 최근 30분
      </p>
      <KpiTiles realtimeActiveUsers={data.realtimeActiveUsers} totals={data.totals} range={data.range} />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Section title="화면별 조회 상위" description="페이지뷰 순, 최대 10개">
            <TopPagesTable pages={data.topPages} />
          </Section>
        </div>
        <div className="lg:col-span-2">
          <Section title="코스 단계별 건수" description="기간 내 이벤트 합계예요. 같은 사람을 따라간 퍼널이 아니에요.">
            <CourseStepList steps={data.courseSteps} />
          </Section>
        </div>
      </div>
    </DashboardShell>
  );
}
