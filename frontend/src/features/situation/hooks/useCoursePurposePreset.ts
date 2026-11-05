"use client";

import { useEffect } from "react";

import { takeCoursePurposePreset } from "@/shared/lib/course-purpose-preset";

import { PURPOSE_CHOICES } from "../model/constants";
import type { PurposeChoice } from "../model/types";

/** 전달값이 실제 목적 선택지일 때만 쓴다. */
export function parseCoursePurposePreset(value: string | null): PurposeChoice | null {
  return PURPOSE_CHOICES.find((choice) => choice === value) ?? null;
}

/**
 * 첫 진입(시간 단계 · rev 없음)에서 홈 바로가기가 맡긴 목적을 꺼내 알려 준다 (issue #332).
 * 호출부가 스냅샷으로 기록하므로 새로고침 · 뒤로가기에도 유지되고, 값은 한 번만 쓰인다.
 * @param active 첫 진입일 때만 true.
 * @param onPreset 목적을 스냅샷에 기록하는 콜백.
 */
export function useCoursePurposePreset(active: boolean, onPreset: (purpose: PurposeChoice) => void): void {
  useEffect(() => {
    if (!active) return;
    const purpose = parseCoursePurposePreset(takeCoursePurposePreset());
    if (purpose) onPreset(purpose);
    // 진입 때 한 번만 확인한다. 콜백은 렌더마다 바뀌어도 다시 실행할 이유가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
