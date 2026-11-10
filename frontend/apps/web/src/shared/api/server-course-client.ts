import "server-only";

import {
  courseDetailResponseSchema,
  courseDeleteResponseSchema,
  courseSummaryListResponseSchema,
  courseSaveResponseSchema,
  courseUpdateResponseSchema,
  type CourseDetailResponse,
  type CourseDeleteResponse,
  type CourseSummaryListResponse,
  type CourseSaveRequest,
  type CourseSaveResponse,
  type CourseUpdateRequest,
  type CourseUpdateResponse,
} from "./openapi/dayro.openapi";
import { BackendApiError, toBackendApiError } from "./backend-error";
import { requestBackend } from "./backend-request";
import { BFF_MESSAGES } from "./bff-messages";

/** 저장 코스 백엔드 오류. 공통 `BackendApiError`와 같으며 기존 import 이름을 유지한다. */
export class BackendCourseRequestError extends BackendApiError {
  constructor(status: number, message: string) {
    super(status, message);
    this.name = "BackendCourseRequestError";
  }
}

/** 백엔드 오류 응답을 저장 코스 오류로 바꾼다(문구·상태 규칙은 `toBackendApiError`와 같다). */
function toCourseRequestError(response: Response, json: unknown, fallbackMessage: string) {
  const error = toBackendApiError(response, json, fallbackMessage);
  return new BackendCourseRequestError(error.status, error.message);
}

/** 저장 코스 호출 공통 처리. 오류는 `BackendCourseRequestError` 로 던진다. */
function requestBackendCourse<T>(
  pathname: string,
  init: RequestInit,
  parse: (json: unknown) => T,
  fallbackMessage: string,
): Promise<T> {
  return requestBackend(pathname, init, parse, fallbackMessage, { toError: toCourseRequestError });
}

/** 백엔드 저장 코스 id 형식(UUID). */
const COURSE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 저장 코스 상세·수정·삭제 경로를 만든다.
 * id 를 UUID 형식으로 검증하고 인코딩해, `../auth/withdraw` 같은 값이 다른 백엔드 API 경로로
 * 정규화되는 것을 막는다(issue #139 S3). 형식이 아니면 400 으로 거절한다.
 * @param courseId 라우트 파라미터로 받은 저장 코스 id.
 */
export function buildCourseDetailPath(courseId: string): string {
  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new BackendCourseRequestError(400, BFF_MESSAGES.course.invalidRequest);
  }
  return `/api/courses/${encodeURIComponent(courseId)}`;
}

/**
 * 인증된 사용자의 저장 코스 생성 요청을 외부 백엔드에 전달한다.
 * access token 으로 Authorization 헤더를 만들고 백엔드 저장 응답 계약을 검증한다.
 */
export async function saveCourseWithBackendAccessToken(
  accessToken: string,
  request: CourseSaveRequest,
): Promise<CourseSaveResponse> {
  return requestBackendCourse(
    "/api/courses",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    (json) => courseSaveResponseSchema.parse(json),
    BFF_MESSAGES.course.saveFailed,
  );
}

/**
 * 인증된 사용자의 저장 코스 목록 조회를 외부 백엔드에 전달한다.
 * access token 으로 Authorization 헤더를 만들고 백엔드 목록 응답 계약을 검증한다.
 */
export async function fetchCoursesWithBackendAccessToken(
  accessToken: string,
): Promise<CourseSummaryListResponse> {
  return requestBackendCourse(
    "/api/courses",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => courseSummaryListResponseSchema.parse(json),
    BFF_MESSAGES.course.listFailed,
  );
}

/**
 * 인증된 사용자의 저장 코스 상세 조회를 외부 백엔드에 전달한다.
 * access token 으로 Authorization 헤더를 만들고 상세 응답 계약을 검증한다.
 */
export async function fetchCourseDetailWithBackendAccessToken(
  accessToken: string,
  courseId: string,
): Promise<CourseDetailResponse> {
  return requestBackendCourse(
    buildCourseDetailPath(courseId),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => courseDetailResponseSchema.parse(json),
    BFF_MESSAGES.course.detailFailed,
  );
}

/**
 * 인증된 사용자의 저장 코스 수정 요청을 외부 백엔드에 전달한다.
 * access token 으로 Authorization 헤더를 만들고 수정 응답 계약을 검증한다.
 */
export async function updateCourseWithBackendAccessToken(
  accessToken: string,
  courseId: string,
  request: CourseUpdateRequest,
): Promise<CourseUpdateResponse> {
  return requestBackendCourse(
    buildCourseDetailPath(courseId),
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    (json) => courseUpdateResponseSchema.parse(json),
    BFF_MESSAGES.course.updateFailed,
  );
}

/**
 * 인증된 사용자의 저장 코스 삭제 요청을 외부 백엔드에 전달한다.
 * access token 으로 Authorization 헤더를 만들고 void 삭제 응답 계약을 검증한다.
 */
export async function deleteCourseWithBackendAccessToken(
  accessToken: string,
  courseId: string,
): Promise<CourseDeleteResponse> {
  return requestBackendCourse(
    buildCourseDetailPath(courseId),
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => courseDeleteResponseSchema.parse(json),
    BFF_MESSAGES.course.deleteFailed,
  );
}
