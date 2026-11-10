import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthTokenCookies,
  logoutWithBackendAccessToken,
  readAccessTokenCookie,
  setMemberSeenCookie,
} from "../../../../shared/api/server-auth";
import { BFF_MESSAGES } from "../../../../shared/api/bff-messages";

/**
 * 현재 세션을 종료한다.
 * access token 이 있으면 백엔드 로그아웃을 먼저 시도하고,
 * 성공 여부와 무관하게 브라우저 쿠키는 항상 제거한다.
 * @param request 현재 요청. access token 쿠키를 읽고 제거 옵션도 계산한다.
 */
export async function DELETE(request: NextRequest) {
  const accessToken = readAccessTokenCookie(request);

  let verifiedMember = false;

  if (accessToken) {
    try {
      await logoutWithBackendAccessToken(accessToken);
      verifiedMember = true;
    } catch {
      // 쿠키 제거는 항상 진행해 로컬 세션을 정리한다.
    }
  }

  const response = NextResponse.json({
    success: true,
    message: BFF_MESSAGES.auth.loggedOut,
    data: null,
  });

  clearAuthTokenCookies(request, response);
  // 이번 배포 전에 로그인한 회원도 다시 로그인할 때 확인 화면을 보지 않게 한다(issue #181 · #324).
  if (verifiedMember) {
    setMemberSeenCookie(request, response);
  }
  return response;
}
