"use client";

import { useEffect, type MouseEvent } from "react";
import Link from "next/link";

import { clearCoursePurposePreset, writeCoursePurposePreset } from "@/shared/lib/course-purpose-preset";
import { cn } from "@/shared/ui/lib";

import styles from "./css/HomeCards.module.css";

export interface HomePurposeLinkProps {
  label: string;
  href: string;
  /** 상황 입력에 미리 선택할 목적. 사용자는 목적 단계에서 바꿀 수 있다. */
  purpose: string;
  tone: "warm" | "cool";
  className?: string;
}

/** 목적 바로가기 (features/home, issue #332). 스크립트 없이도 코스 만들기로 이동한다. */
export function HomePurposeLink({ label, href, purpose, tone, className }: HomePurposeLinkProps) {
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
      className={cn(styles.tile, styles.purpose, tone === "warm" ? styles.warm : styles.cool, className)}
    >
      {label}
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
