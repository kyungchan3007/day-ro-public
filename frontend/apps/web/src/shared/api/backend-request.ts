import "server-only";

import { getBackendBaseUrl } from "./backend-base-url";
import { readBackendJson, toBackendApiError } from "./backend-error";

export interface BackendRequestOptions {
  /** 기본값은 no-store. */
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  /** 오류 응답을 도메인 예외로 바꿀 때 쓴다. 기본값은 `toBackendApiError`. */
  toError?: (response: Response, json: unknown, fallbackMessage: string) => Error;
}

/**
 * 외부 백엔드 호출 공통 transport(issue #349).
 * `pathname` 과 `init` 으로 요청을 보내고, 오류 응답은 예외로 바꾸고, 성공 응답은 `parse` 로 계약을 검증한다.
 * 인증 · 쿠키 · 기기 헤더 조합은 호출부가 `init` 으로 넘긴다.
 * @param pathname 백엔드 경로.
 * @param init fetch 옵션.
 * @param parse 성공 응답 계약 검증.
 * @param fallbackMessage 엔드포인트별 기본 오류 문구.
 * @param options 캐시 정책 · 오류 변환.
 */
export async function requestBackend<T>(
  pathname: string,
  init: RequestInit,
  parse: (json: unknown) => T,
  fallbackMessage: string,
  options?: BackendRequestOptions,
): Promise<T> {
  const response = await fetch(new URL(pathname, getBackendBaseUrl()), {
    ...init,
    cache: options?.cache ?? "no-store",
    next: options?.next,
  });

  const json = await readBackendJson(response);

  if (!response.ok) {
    throw (options?.toError ?? toBackendApiError)(response, json, fallbackMessage);
  }

  return parse(json);
}
