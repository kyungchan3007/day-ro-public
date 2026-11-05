import { NextRequest, NextResponse } from "next/server";
import {
  AGE_CHECK_ENTRY_PARAM,
  AGE_CHECK_MEMBER_ENTRY,
  buildAgeCheckPath,
  needsAgeCheck,
  readAgeCheckSignals,
} from "@/features/auth/model/age-check";
import {
  buildKakaoAuthorizeUrl,
  createOAuthState,
  sanitizeLoginNextPath,
} from "@/features/auth/model/oauth";
import {
  buildKakaoCallbackUrl,
  clearOAuthNextCookie,
  getKakaoRestApiKey,
  redirectToInternalPath,
  setOAuthNextCookie,
  setOAuthStateCookie,
} from "@/shared/api/server-auth";
import { decodeNextPathParam } from "@/shared/lib/next-path-param";

export async function GET(request: NextRequest) {
  // 운영(Workers)에서 쿼리의 & 가 잘리지 않도록 폼은 base64url 로 보내고 여기서 되돌린다(issue #200).
  const next = sanitizeLoginNextPath(decodeNextPathParam(request.nextUrl.searchParams.get("next")));

  // 확인 전이면 카카오로 보내지 않는다. "이미 회원이에요"는 통과시키고 신규 여부는 백엔드가 막는다(issue #324).
  const isMemberEntry = request.nextUrl.searchParams.get(AGE_CHECK_ENTRY_PARAM) === AGE_CHECK_MEMBER_ENTRY;
  if (!isMemberEntry && needsAgeCheck(readAgeCheckSignals(request.cookies))) {
    return redirectToInternalPath(buildAgeCheckPath({ intent: "login", next }), 307);
  }

  const clientId = getKakaoRestApiKey();

  if (!clientId) {
    const failureUrl = new URL("/login?error=oauth_config_missing", request.url);
    return NextResponse.redirect(failureUrl);
  }

  const state = createOAuthState();
  const redirectUri = buildKakaoCallbackUrl(request);
  const authorizeUrl = buildKakaoAuthorizeUrl({
    clientId,
    redirectUri,
    state,
  });

  const response = NextResponse.redirect(authorizeUrl);
  setOAuthStateCookie(request, response, state);
  // 로그인 후 돌아갈 화면: 검증된 내부 경로만 보관하고, 없으면 이전 시도의 값을 지운다.
  if (next) {
    setOAuthNextCookie(request, response, next);
  } else {
    clearOAuthNextCookie(request, response);
  }
  return response;
}
