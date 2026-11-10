"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 마우스를 잠깐 올려 둬야 미리보기를 연다. 카드 위를 스쳐 지나갈 때 깜빡이지 않게 한다. */
const HOVER_DELAY_MS = 350;

/**
 * 선택 화면 마우스 미리보기 상태 (features/course-result, issue #365).
 * 마우스가 있는 기기(hover · fine pointer)에서만 동작한다. 휴대폰은 정보 버튼(ⓘ)으로 본다.
 * 미리보기는 카드 칸 안에 있어 마우스를 미리보기로 옮겨도 유지되고, Esc 로 닫는다.
 */
export function usePlacePreview() {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  // 미리보기는 Esc 로 닫을 수 있어야 한다(WCAG 1.4.13).
  useEffect(() => {
    if (previewId == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewId]);

  const enter = useCallback(
    (placeId: string) => {
      if (typeof window === "undefined" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }
      clearTimer();
      timer.current = setTimeout(() => setPreviewId(placeId), HOVER_DELAY_MS);
    },
    [clearTimer],
  );

  const leave = useCallback(() => {
    clearTimer();
    setPreviewId(null);
  }, [clearTimer]);

  return { previewId, enter, leave };
}
