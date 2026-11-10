"use client";

import { useCallback, useState } from "react";

import type { PlaceCandidate } from "@/shared/api/openapi/dayro.openapi";

import { resolvePlaceInfoAction } from "../model/place-info";
import { usePlacePreview } from "./usePlacePreview";

export interface UsePlaceInfoOptions {
  candidates: readonly PlaceCandidate[];
  isSelected: (placeId: string) => boolean;
  full: boolean;
  toggle: (place: PlaceCandidate) => void;
}

/**
 * 선택 화면 장소 정보 상태 (features/course-result, issue #365).
 * 휴대폰은 ⓘ → 시트, 마우스는 올려 두면 미리보기. 시트에서 고르거나 해제하면 닫는다.
 * 다른 코스 보기로 후보가 바뀌어 열린 장소가 없어지면 시트는 저절로 닫힌다.
 */
export function usePlaceInfo({ candidates, isSelected, full, toggle }: UsePlaceInfoOptions) {
  const [openId, setOpenId] = useState<string | null>(null);
  const preview = usePlacePreview();
  const place = candidates.find((p) => p.placeId === openId) ?? null;
  const action = place ? resolvePlaceInfoAction(isSelected(place.placeId), full) : "select";

  const open = useCallback(
    (placeId: string) => {
      preview.leave();
      setOpenId(placeId);
    },
    [preview],
  );
  const close = useCallback(() => setOpenId(null), []);
  const confirm = useCallback(() => {
    if (!place || action === "blocked") return;
    toggle(place);
    setOpenId(null);
  }, [action, place, toggle]);

  return {
    place,
    action,
    open,
    close,
    confirm,
    /** 시트가 열려 있으면 미리보기를 띄우지 않는다. */
    previewId: openId == null ? preview.previewId : null,
    enterPreview: preview.enter,
    leavePreview: preview.leave,
  };
}
