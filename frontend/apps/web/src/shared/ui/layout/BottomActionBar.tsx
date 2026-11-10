import type { ReactNode } from "react";
import { cn } from "@dayro/ui";
import styles from "./css/BottomActionBar.module.css";

export interface BottomActionBarProps {
  children: ReactNode;
  /** 가로 정렬. 기본 stretch(버튼 꽉 채움), center 는 안내 문구 + 링크처럼 가운데 모을 때. */
  align?: "stretch" | "center";
  className?: string;
}

/**
 * bottom-action-bar : 화면 하단 행동 버튼 영역 (issue #309).
 * 상황입력 · 코스 결과 · 코스 지도 · 찜 상세 · FAQ · 문의 · 탈퇴가 여백을 제각각 따로 쓰던 것을 묶었다.
 * 여백 16 · 20px + 하단 안전영역, 위 구분선, 버튼 여러 개면 세로로 10px 간격.
 * `AppShell` 의 `footer` 슬롯이나 폼 아래에 둔다.
 */
export function BottomActionBar({ children, align = "stretch", className }: BottomActionBarProps) {
  return (
    <div className={cn(styles.bar, align === "center" && styles.center, className)}>{children}</div>
  );
}
