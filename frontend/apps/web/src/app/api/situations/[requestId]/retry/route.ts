import { NextRequest } from "next/server";
import { bffFailure } from "../../../../../shared/api/backend-error";
import { retrySituation } from "../../../../../shared/api/server-situation";
import { respondWithSituationIdentity } from "../../../../../shared/api/server-situation-bff";
import { BFF_MESSAGES } from "../../../../../shared/api/bff-messages";

/**
 * 다른 코스 보기 retry BFF endpoint.
 * path 의 requestId 를 검증한 뒤 공통 서버 계층으로 전달하고,
 * backend 오류는 `bffErrorResponse` 규칙으로 정리한다(429 한도 소진·404 세션 만료 등 상태 전달, issue #139 S8).
 * 로그인 상태면 httpOnly 쿠키의 access token 을 백엔드에 함께 전달한다(비로그인 허용, issue #135).
 * 비회원 기기 ID 를 `X-Device-Id` 로 넘겨 코스 만들기 · 다른 코스 보기 횟수를 사람 기준으로 센다(#269 · issue #274 · #280).
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await context.params;

  if (!requestId) {
    return bffFailure(BFF_MESSAGES.situation.invalidRetry, 400);
  }

  return respondWithSituationIdentity(
    request,
    (identity) => retrySituation(requestId, identity),
    BFF_MESSAGES.situation.retryFailed,
  );
}
