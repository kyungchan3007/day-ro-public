import type { CourseStep } from "@/features/analytics";

import { formatCount } from "./format";

/** 단계별 이벤트 건수. 같은 사용자를 따라간 순차 퍼널이 아니므로 전환율은 보여 주지 않는다. */
export function CourseStepList({ steps }: { steps: CourseStep[] }) {
  const max = Math.max(1, ...steps.map((step) => step.count));

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => (
        <li key={step.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-control leading-5">
            <span className="text-text-secondary">{step.label}</span>
            <span className="font-semibold tabular-nums text-text-strong">{formatCount(step.count)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-tint" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(step.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
