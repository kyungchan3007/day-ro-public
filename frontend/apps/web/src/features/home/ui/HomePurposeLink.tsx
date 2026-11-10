"use client";

import { useEffect, type MouseEvent } from "react";
import Link from "next/link";

import { clearCoursePurposePreset, writeCoursePurposePreset } from "@/shared/lib/course-purpose-preset";
import { cn } from "@dayro/ui";

import styles from "./css/HomeCards.module.css";

const ICON_PATHS = {
  gift: [
    "M4 8h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z",
    "M12 8v13",
    "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",
    "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",
  ],
  coffee: [
    "M3 14c.83.642 2.077 1.017 3.5 1 1.423.017 2.67-.358 3.5-1 .83-.642 2.077-1.017 3.5-1 1.423-.017 2.67.358 3.5 1",
    "M8 3a2.4 2.4 0 0 0-1 2 2.4 2.4 0 0 0 1 2",
    "M12 3a2.4 2.4 0 0 0-1 2 2.4 2.4 0 0 0 1 2",
    "M3 10h14v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-5z",
    "M16.746 16.726a3 3 0 1 0 .252-5.555",
  ],
} as const;

export interface HomePurposeLinkProps {
  label: string;
  subtitle: string;
  href: string;
  /** 상황 입력에 미리 선택할 목적. 사용자는 목적 단계에서 바꿀 수 있다. */
  purpose: string;
  tone: "warm" | "cool";
  icon: keyof typeof ICON_PATHS;
  className?: string;
}

/** 목적 바로가기 (features/home, issue #332). 스크립트 없이도 코스 만들기로 이동한다. */
export function HomePurposeLink({ label, subtitle, href, purpose, tone, icon, className }: HomePurposeLinkProps) {
  // 홈이 보이면(뒤로가기 복원 포함) 이전 바로가기는 취소된 것이다. 안 지우면 다음 일반 진입에 적용된다.
  useEffect(() => {
    clearCoursePurposePreset();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) clearCoursePurposePreset();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // 새 탭 · 새 창으로 여는 클릭은 이 탭을 떠나지 않으므로 맡기지 않는다.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    writeCoursePurposePreset(purpose);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(styles.tile, styles.purpose, className)}
    >
      <span className={cn(styles.purposeIcon, tone === "warm" ? styles.warm : styles.cool)}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {ICON_PATHS[icon].map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </span>
      <span className={styles.purposeCopy}>
        <span className={styles.purposeTitle}>{label}</span>
        <span className={styles.purposeSubtitle}>{subtitle}</span>
      </span>
    </Link>
  );
}
