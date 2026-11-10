import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { bffErrorResponse } from "./backend-error";
import { readAccessTokenCookie } from "./server-auth";
import { applyDeviceIdCookie, resolveDeviceId } from "./server-device-id";
import type { BackendSituationIdentity } from "./server-situation-backend-client";

/**
 * 상황 BFF(코스 생성 · 다른 코스 보기)의 공통 응답 흐름 (issue #280).
 * 로그인 토큰과 비회원 기기 ID 를 모아 백엔드 호출에 넘기고, 성공 · 실패 응답 모두에 새로 만든 기기 ID 쿠키를 기록한다.
 * 기기 ID 는 백엔드가 코스 만들기 · 다른 코스 보기 횟수를 사람 기준으로 세는 데 쓴다(#269 · #275 · #277 · issue #274).
 * 라우트가 호출 전에 거르는 400(입력 계약 불일치 · requestId 누락)은 이 함수에 오지 않아 쿠키를 발급하지 않는다.
 * 백엔드가 돌려준 400 · 429 · 503 등은 `bffErrorResponse` 로 전달하면서 새 쿠키를 함께 기록한다.
 * @param request 상황 BFF 요청.
 * @param call 토큰 · 기기 ID 로 백엔드를 부르는 함수.
 * @param fallbackMessage 백엔드 오류가 아닌 실패(네트워크 · 계약 불일치)일 때 문구.
 */
export async function respondWithSituationIdentity<T>(
  request: NextRequest,
  call: (identity: BackendSituationIdentity) => Promise<T>,
  fallbackMessage: string,
): Promise<NextResponse> {
  const device = resolveDeviceId(request);
  let response: NextResponse;
  try {
    const result = await call({
      accessToken: readAccessTokenCookie(request),
      deviceId: device.deviceId,
    });
    response = NextResponse.json(result);
  } catch (error) {
    response = bffErrorResponse(error, fallbackMessage);
  }
  return applyDeviceIdCookie(request, response, device);
}
