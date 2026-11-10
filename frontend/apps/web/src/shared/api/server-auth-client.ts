import "server-only";

import {
  authResponseSchema,
  logoutResponseSchema,
  sessionUserSchema,
  withdrawResponseSchema,
  type KakaoLoginRequest,
} from "./openapi/dayro.openapi";
import { AGE_CONFIRMATION_REQUIRED_CODE, BackendApiError } from "./backend-error";
import { requestBackend } from "./backend-request";
import { BFF_MESSAGES } from "./bff-messages";

/**
 * 인증 관련 백엔드 API 호출의 공통 처리기다.
 * @param pathname 백엔드에서 호출할 경로.
 * @param init fetch 옵션.
 * @param fallbackMessage 실패 시 기본 에러 메시지.
 */
function requestBackendAuth(
  pathname: string,
  init: RequestInit,
  fallbackMessage: string,
) {
  return requestBackend(pathname, init, (json) => authResponseSchema.parse(json), fallbackMessage);
}

/** 카카오 OAuth 시작에 필요한 REST API 키를 읽는다. */
export function getKakaoRestApiKey() {
  return process.env.KAKAO_REST_API_KEY ?? "";
}

/**
 * 카카오 인가 코드를 백엔드 로그인 API에 전달한다.
 * @param code 카카오가 redirect URI 에 붙여준 일회용 인가 코드.
 * @param age14OrOlderConfirmed 이번 로그인 전에 만 14세 이상을 체크했는지(issue #324).
 */
export async function loginWithBackendKakaoCode(code: string, age14OrOlderConfirmed: boolean) {
  return requestBackendAuth(
    "/api/auth/kakao/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, age14OrOlderConfirmed } satisfies KakaoLoginRequest),
    },
    "oauth_backend_failed",
  );
}

/** 백엔드가 "신규 회원인데 만 14세 확인값이 없다"며 가입을 거절한 오류인지 판단한다(issue #324). */
export function isAgeConfirmationRequiredError(error: unknown) {
  return (
    error instanceof BackendApiError &&
    error.status === 403 &&
    error.code === AGE_CONFIRMATION_REQUIRED_CODE
  );
}

/**
 * 저장된 refresh token 으로 새 앱 access token 을 발급받는다.
 * @param refreshToken 브라우저 쿠키에 저장된 앱 refresh token.
 */
export async function refreshBackendAuth(refreshToken: string) {
  return requestBackendAuth(
    "/api/auth/refresh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    },
    BFF_MESSAGES.auth.invalidToken,
  );
}

/**
 * 현재 access token 으로 백엔드 현재 사용자 정보를 조회한다.
 * @param accessToken 현재 세션의 앱 access token.
 */
export async function fetchBackendCurrentUser(accessToken: string) {
  return requestBackend(
    "/api/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => {
      if (
        typeof json !== "object" ||
        json === null ||
        !("data" in json)
      ) {
        throw new Error(BFF_MESSAGES.auth.profileFailed);
      }

      return sessionUserSchema.parse(json.data);
    },
    BFF_MESSAGES.auth.profileFailed,
  );
}

/**
 * 현재 access token 을 Authorization 헤더에 실어 백엔드 로그아웃을 요청한다.
 * @param accessToken 현재 세션의 앱 access token.
 */
export async function logoutWithBackendAccessToken(accessToken: string) {
  return requestBackend(
    "/api/auth/logout",
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => logoutResponseSchema.parse(json),
    BFF_MESSAGES.auth.logoutFailed,
  );
}

/**
 * 현재 access token 을 Authorization 헤더에 실어 백엔드 회원탈퇴를 요청한다.
 * @param accessToken 현재 세션의 앱 access token.
 */
export async function withdrawWithBackendAccessToken(accessToken: string) {
  return requestBackend(
    "/api/auth/withdraw",
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    (json) => withdrawResponseSchema.parse(json),
    BFF_MESSAGES.auth.withdrawFailed,
  );
}
