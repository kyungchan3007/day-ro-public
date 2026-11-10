"use client";

import { useState } from "react";

import { resolvePlacePhotoSrc } from "@/shared/api/place-photo";

/** 장소 사진 주소와 실패 상태. 불러오다 실패하면 기본 이미지로 바꾼다(issue #365). */
export function usePlacePhoto(photoUrl: string | null | undefined) {
  const src = resolvePlacePhotoSrc(photoUrl);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return {
    src: src != null && failedSrc !== src ? src : null,
    onError: () => setFailedSrc(src),
  };
}
