import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import { isSecureRequest } from "./server-auth-cookies";

/** 비회원 기기 ID 쿠키 이름 (issue #274). */
export const DEVICE_ID_COOKIE_NAME = "dayro_device_id";
/** 백엔드가 비회원 "코스 만들기 · 다른 코스 보기" 횟수를 세는 헤더 (#269 · #275 · #277). */
export const DEVICE_ID_HEADER = "X-Device-Id";
/** 상황 API 요청에만 실리도록 경로를 한정한다 — 페이지 요청 · 정적 캐시에는 붙지 않는다. */
const DEVICE_ID_COOKIE_PATH = "/api/situations";
const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ResolvedDeviceId {
  deviceId: string;
  /** 이번 요청에서 새로 만든 값이면 true — 응답에 쿠키를 기록해야 한다. */
  issued: boolean;
}

/**
 * 요청 쿠키의 기기 ID 를 읽고, 없거나 UUID 형식이 아니면 새로 만든다.
 * 백엔드는 UUID 가 아니면 헤더가 없는 것으로 보고 세션 기준으로 세므로 형식이 틀린 값은 버린다.
 * @param request 상황 API 요청.
 */
export function resolveDeviceId(request: NextRequest): ResolvedDeviceId {
  const current = request.cookies.get(DEVICE_ID_COOKIE_NAME)?.value?.trim();
  if (current && UUID_PATTERN.test(current)) {
    return { deviceId: current, issued: false };
  }
  return { deviceId: crypto.randomUUID(), issued: true };
}

/**
 * 새로 만든 기기 ID 를 응답 쿠키로 기록한다. 기존 값을 재사용했으면 아무것도 하지 않는다.
 * @param request 현재 요청(Secure 판정용).
 * @param response 쿠키를 기록할 응답(성공 · 실패 모두).
 * @param resolved `resolveDeviceId` 결과.
 */
export function applyDeviceIdCookie(
  request: NextRequest,
  response: NextResponse,
  resolved: ResolvedDeviceId,
): NextResponse {
  if (resolved.issued) {
    response.cookies.set(DEVICE_ID_COOKIE_NAME, resolved.deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: DEVICE_ID_COOKIE_PATH,
      maxAge: DEVICE_ID_MAX_AGE_SECONDS,
    });
  }
  return response;
}
