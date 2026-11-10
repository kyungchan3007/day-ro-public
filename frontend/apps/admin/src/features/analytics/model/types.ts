/**
 * 어드민 대시보드 화면 계약 (issue #374).
 * 화면(widgets)은 이 타입만 알고, GA4 응답 형태는 features/analytics/server 안에서 이 형태로 바꾼다.
 */

/** 조회 기간(일). 오늘은 수집 지연이 있어 빼고 어제까지 센다. */
export const DASHBOARD_RANGES = [7, 28] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export function parseDashboardRange(value: unknown): DashboardRange {
  return value === "28" || value === 28 ? 28 : 7;
}

/** 코스 단계별 건수 — 순차 퍼널이 아니라 기간 내 이벤트 합계다. */
export type CourseStepKey = "course_new_view" | "course_generated" | "course_saved" | "course_shared";

export interface CourseStep {
  key: CourseStepKey;
  label: string;
  count: number;
}

export interface TopPage {
  path: string;
  views: number;
  activeUsers: number;
}

export interface DashboardTotals {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
}

export interface DashboardViewModel {
  range: DashboardRange;
  /** 최근 30분 활성 사용자. 실시간 조회만 실패하면 null 로 두고 나머지는 보여 준다. */
  realtimeActiveUsers: number | null;
  totals: DashboardTotals;
  /** 조회수 내림차순, 최대 10개 */
  topPages: TopPage[];
  /** course_new_view → course_generated → course_saved → course_shared 순서 고정 */
  courseSteps: CourseStep[];
  /** 서버가 조회를 마친 시각(ISO 8601) */
  generatedAt: string;
}

export type DashboardResult =
  | { ok: true; data: DashboardViewModel }
  /** not_configured: GA4 시크릿 미설정 / upstream_error: 토큰 교환 · Data API 실패 · 응답 검증 실패 */
  | { ok: false; reason: "not_configured" | "upstream_error" };
