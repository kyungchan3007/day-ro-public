import type { PlaceCandidate } from "@/shared/api/openapi/dayro.openapi";
import { buildPlaceDetails, type PlaceDetailRow } from "@/shared/lib/place-detail";

/** 정보 시트 선택 버튼 동작 (issue #365). */
export type PlaceInfoAction = "select" | "deselect" | "blocked";

/**
 * 이미 고른 장소는 해제, 최대에 도달했으면 새로 고르지 못하고, 그 밖에는 선택.
 * @param selected 이 장소를 이미 골랐는지.
 * @param full 최대 선택에 도달했는지.
 */
export function resolvePlaceInfoAction(selected: boolean, full: boolean): PlaceInfoAction {
  if (selected) return "deselect";
  return full ? "blocked" : "select";
}

export interface PlaceInfoView {
  meta: string;
  rating: number | null;
  reviewCount: number | null;
  details: PlaceDetailRow[];
}

/**
 * 정보 시트 · 마우스 미리보기에 쓸 값. 평점은 요약 줄(리뷰 수 포함)에만 두고 상세 줄에서는 뺀다.
 * @param place 후보 장소.
 */
export function buildPlaceInfoView(place: PlaceCandidate): PlaceInfoView {
  return {
    meta: [place.category, place.district].filter(Boolean).join(" · "),
    rating: place.rating,
    reviewCount: place.userRatingCount,
    details: buildPlaceDetails({ businessHours: place.businessHours, address: place.address, rating: null }),
  };
}
