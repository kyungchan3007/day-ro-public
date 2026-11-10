/**
 * course-result feature public API.
 * 추천 결과 선택/재추천 흐름만 노출한다.
 */
export { useCourseSelection } from "./hooks/useCourseSelection";
export { useCourseResult } from "./hooks/useCourseResult";
export { useCourseReroll } from "./hooks/useCourseReroll";
export { PlaceInfo } from "./ui/PlaceInfo";
export { PlaceInfoSheet } from "./ui/PlaceInfoSheet";
export { usePlacePreview } from "./hooks/usePlacePreview";
export { usePlaceInfo } from "./hooks/usePlaceInfo";
export { resolvePlaceInfoAction, buildPlaceInfoView } from "./model/place-info";
export type { PlaceInfoAction } from "./model/place-info";
export { resolvePlaceCategoryTile } from "./model/place-category-tile";
export type { PlaceCategoryTile, PlaceTileIcon, PlaceTileTone } from "./model/place-category-tile";
export {
  MIN_REQUIRED_PLACES,
  MAX_SELECTABLE_PLACES,
  toggleSelection,
  selectionOrderOf,
  isSelectionValid,
  isSelectionFull,
  selectionHint,
} from "./model/course-selection";
export type {
  UseCourseResultOptions,
  UseCourseResultValue,
} from "./hooks/useCourseResult";
export type { UseCourseRerollOptions } from "./hooks/useCourseReroll";
