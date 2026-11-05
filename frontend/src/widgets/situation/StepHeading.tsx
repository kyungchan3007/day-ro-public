import type { ReactNode } from "react";
import { cn } from "@/shared/ui";

export interface StepHeadingProps {
  children: ReactNode;
  /** 화면별 위 여백 등 배치만 넘긴다. */
  className?: string;
}

/**
 * 상황입력 단계(목적 · 지역 · 시간) 큰 제목 (issue #309).
 * 세 화면이 같은 글자 스타일을 따로 적던 것을 이 슬라이스 안에서 묶었다.
 */
export function StepHeading({ children, className }: StepHeadingProps) {
  return (
    <h1 className={cn("text-center text-display font-bold leading-snug text-text-strong", className)}>
      {children}
    </h1>
  );
}
