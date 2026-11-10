import type { CourseSummaryItem } from "../../../shared/api/openapi/dayro.openapi";
import { formatKoreanDate } from "../../../shared/lib/format-date";

export interface SavedCourseCardViewModel {
  id: string;
  name: string;
  desc?: string;
  meta: string;
  date: string;
}

/**
 * 저장 코스 목록 API 응답을 `/saved` 카드 표시 계약으로 변환한다.
 * 목록 API 설명 필드는 카드 소개 문구로 그대로 노출한다.
 */
export function buildSavedCourseCardViewModel(
  course: CourseSummaryItem,
): SavedCourseCardViewModel {
  return {
    id: course.id,
    name: course.title,
    desc: course.description ?? undefined,
    meta: `${course.placeCount}곳 · ${course.regionName}`,
    date: formatKoreanDate(course.createdAt, " 저장"),
  };
}
