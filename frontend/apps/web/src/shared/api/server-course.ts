import "server-only";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE_NAME } from "./auth-cookies";
import {
  courseSaveRequestSchema,
  courseUpdateRequestSchema,
} from "./openapi/dayro.openapi";
import { readAccessTokenCookie } from "./server-auth-cookies";
import { resolveAuthSessionFromRequest } from "./server-auth-session";
import {
  BackendCourseRequestError,
  deleteCourseWithBackendAccessToken,
  fetchCourseDetailWithBackendAccessToken,
  fetchCoursesWithBackendAccessToken,
  saveCourseWithBackendAccessToken,
  updateCourseWithBackendAccessToken,
} from "./server-course-client";
import { withResponseCookies } from "./server-response-cookies";
import { bffFailure, toBffErrorStatus } from "./backend-error";
import { BFF_MESSAGES } from "./bff-messages";

/** 저장 · 수정 요청 본문 검증 규칙. */
interface CourseRequestBody<TPayload> {
  schema: {
    safeParse(input: unknown): { success: true; data: TPayload } | { success: false };
  };
  invalidMessage: string;
}

/**
 * 저장 코스 BFF 공통 흐름: 세션 확인 → (본문 검증) → 토큰 확인 → 백엔드 호출 → 오류 정리.
 * 세션 단계에서 쌓인 쿠키는 모든 응답에 복사한다.
 * 입력 검증과 백엔드 호출을 분리한다. 백엔드 응답 계약 불일치(ZodError)를 입력 오류(400)로 오인하지 않기 위함이다(issue #139 S8).
 * 예상 밖 예외를 로그 없이 502 로 정리하므로 `bffErrorResponse` 를 쓰지 않는다(issue #346).
 * @param request 현재 요청.
 * @param failedMessage 백엔드 오류가 아닌 실패의 문구.
 * @param call access token 과 검증한 본문으로 백엔드를 부르는 함수.
 * @param body 본문을 받는 요청의 검증 규칙. 없으면 본문을 읽지 않는다.
 */
async function withCourseSession<TPayload = undefined>(
  request: NextRequest,
  failedMessage: string,
  call: (accessToken: string, payload: TPayload) => Promise<unknown>,
  body?: CourseRequestBody<TPayload>,
): Promise<NextResponse> {
  const cookieResponse = new NextResponse();
  const session = await resolveAuthSessionFromRequest(request, cookieResponse);
  const unauthorized = () =>
    withResponseCookies(cookieResponse, bffFailure(BFF_MESSAGES.auth.loginRequired, 401));

  if (!session.authenticated || !session.user) {
    return unauthorized();
  }

  // 본문이 없는 요청의 payload 는 쓰이지 않는다(TPayload = undefined).
  let payload = undefined as TPayload;
  if (body) {
    const parsed = body.schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return withResponseCookies(cookieResponse, bffFailure(body.invalidMessage, 400));
    }
    payload = parsed.data;
  }

  try {
    const accessToken =
      cookieResponse.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value ??
      readAccessTokenCookie(request);

    if (!accessToken) {
      return unauthorized();
    }

    const result = await call(accessToken, payload);
    return withResponseCookies(cookieResponse, NextResponse.json(result));
  } catch (error) {
    const response =
      error instanceof BackendCourseRequestError
        ? bffFailure(error.message, toBffErrorStatus(error.status))
        : bffFailure(failedMessage, 502);

    return withResponseCookies(cookieResponse, response);
  }
}

/**
 * 코스 저장 BFF 요청을 처리한다.
 * 세션 해석, payload 검증, 백엔드 저장 transport 호출과 에러 응답 정규화를 함께 맡는다.
 */
export function saveCourseFromRequest(request: NextRequest) {
  return withCourseSession(
    request,
    BFF_MESSAGES.course.saveFailed,
    saveCourseWithBackendAccessToken,
    { schema: courseSaveRequestSchema, invalidMessage: BFF_MESSAGES.course.invalidSave },
  );
}

/**
 * 코스 목록 BFF 요청을 처리한다.
 * 세션 해석과 backend 목록 transport 호출, 에러 응답 정규화를 Route Handler 밖으로 분리한다.
 */
export function listCoursesFromRequest(request: NextRequest) {
  return withCourseSession(request, BFF_MESSAGES.course.listFailed, (accessToken) =>
    fetchCoursesWithBackendAccessToken(accessToken),
  );
}

/**
 * `/saved` 같은 Server Component 화면에서 현재 사용자 저장 코스 목록을 읽는다.
 * 보호 화면 가드(세션 복구 경로 포함)를 지난 access token 쿠키를 사용해 backend 목록 계약을 그대로 가져온다.
 */
export async function getCoursesForServerComponent() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;

  if (!accessToken) {
    throw new Error(BFF_MESSAGES.auth.loginRequired);
  }

  return fetchCoursesWithBackendAccessToken(accessToken);
}

/**
 * 코스 상세 BFF 요청을 처리한다.
 * 세션 해석과 backend 상세 transport 호출, 에러 응답 정규화를 Route Handler 밖으로 분리한다.
 */
export function getCourseDetailFromRequest(request: NextRequest, courseId: string) {
  return withCourseSession(request, BFF_MESSAGES.course.detailFailed, (accessToken) =>
    fetchCourseDetailWithBackendAccessToken(accessToken, courseId),
  );
}

/**
 * `/saved/[id]` 같은 Server Component 화면에서 현재 사용자 저장 코스 상세를 읽는다.
 * 보호 화면 가드(세션 복구 경로 포함)를 지난 access token 쿠키를 사용해 backend 상세 계약을 그대로 가져온다.
 */
export async function getCourseDetailForServerComponent(courseId: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value ?? null;

  if (!accessToken) {
    throw new Error(BFF_MESSAGES.auth.loginRequired);
  }

  return fetchCourseDetailWithBackendAccessToken(accessToken, courseId);
}

/**
 * 코스 수정 BFF 요청을 처리한다.
 * 세션 해석, payload 검증, backend 수정 transport 호출과 에러 응답 정규화를 함께 맡는다.
 */
export function updateCourseFromRequest(request: NextRequest, courseId: string) {
  return withCourseSession(
    request,
    BFF_MESSAGES.course.updateFailed,
    (accessToken, payload) => updateCourseWithBackendAccessToken(accessToken, courseId, payload),
    { schema: courseUpdateRequestSchema, invalidMessage: BFF_MESSAGES.course.invalidUpdate },
  );
}

/**
 * 코스 삭제 BFF 요청을 처리한다.
 * 세션 해석, backend 삭제 transport 단일 호출과 에러 응답 정규화를 맡는다.
 */
export function deleteCourseFromRequest(request: NextRequest, courseId: string) {
  return withCourseSession(request, BFF_MESSAGES.course.deleteFailed, (accessToken) =>
    deleteCourseWithBackendAccessToken(accessToken, courseId),
  );
}
