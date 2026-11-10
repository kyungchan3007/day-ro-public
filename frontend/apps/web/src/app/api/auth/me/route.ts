import { NextRequest, NextResponse } from "next/server";
import { hasMemberSeenCookie, setMemberSeenCookie } from "../../../../shared/api/server-auth";
import { resolveAuthSessionFromRequest } from "../../../../shared/api/server-auth-session";
import { withResponseCookies } from "../../../../shared/api/server-response-cookies";

/**
 * 현재 세션 사용자 조회 BFF.
 *
 * 홈 우측 메뉴처럼 비보호 라우트에서도 로그인 상태를 알아야 하므로,
 * 이 엔드포인트가 access token 검증과 필요 시 refresh 재발급까지 담당한다.
 */
export async function GET(request: NextRequest) {
  const response = new NextResponse();
  const session = await resolveAuthSessionFromRequest(request, response);
  const jsonResponse = withResponseCookies(response, NextResponse.json(session));

  // 인증이 확인된 회원만 표시한다. 확인 화면을 건너뛸지 판단하는 값이다(issue #324).
  if (session.authenticated && !hasMemberSeenCookie(request)) {
    setMemberSeenCookie(request, jsonResponse);
  }

  return jsonResponse;
}
