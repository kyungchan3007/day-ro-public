/**
 * 장소 카테고리(백엔드 PlaceCategory.label) → 카드 아이콘 타일 표현 규칙 (issue #370).
 * 순수 함수라 화면 · 훅과 무관하다. 모르는 값은 중립 톤 + 기본 핀 아이콘으로 떨어진다.
 */
export type PlaceTileTone = "warm" | "cool" | "neutral";
export type PlaceTileIcon = "utensils" | "coffee" | "sparkles" | "frame" | "tree" | "bag" | "moon" | "pin";

export interface PlaceCategoryTile {
  icon: PlaceTileIcon;
  tone: PlaceTileTone;
}

const TILES: Record<string, PlaceCategoryTile> = {
  식사: { icon: "utensils", tone: "warm" },
  카페: { icon: "coffee", tone: "warm" },
  쇼핑: { icon: "bag", tone: "warm" },
  액티비티: { icon: "sparkles", tone: "cool" },
  전시: { icon: "frame", tone: "cool" },
  산책: { icon: "tree", tone: "cool" },
  "야경/바": { icon: "moon", tone: "cool" },
};

const FALLBACK: PlaceCategoryTile = { icon: "pin", tone: "neutral" };

export function resolvePlaceCategoryTile(category: string | null | undefined): PlaceCategoryTile {
  const key = category?.trim();
  return (key && Object.hasOwn(TILES, key) ? TILES[key] : undefined) ?? FALLBACK;
}
