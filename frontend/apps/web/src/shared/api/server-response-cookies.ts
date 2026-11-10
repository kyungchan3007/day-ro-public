import "server-only";

import type { NextResponse } from "next/server";

/**
 * 내부 BFF 단계에서 쌓은 쿠키를 최종 응답으로 복사한다.
 * refresh 재발급 같은 중간 부수효과를 브라우저까지 유지할 때 사용한다.
 */
export function copyResponseCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

/** 쿠키를 복사한 최종 응답을 그대로 돌려준다 — `return withResponseCookies(cookieResponse, response)` (issue #314). */
export function withResponseCookies(from: NextResponse, to: NextResponse): NextResponse {
  copyResponseCookies(from, to);
  return to;
}
