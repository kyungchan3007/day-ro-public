import { NextRequest, NextResponse } from "next/server";
import { situationInputRequestSchema } from "../../../shared/api/openapi/dayro.openapi";
import { submitSituation } from "../../../shared/api/server-situation";
import { respondWithSituationIdentity } from "../../../shared/api/server-situation-bff";
import { BFF_MESSAGES } from "../../../shared/api/bff-messages";

/**
 * 상황 제출 BFF endpoint.
 * 브라우저 요청 body 를 `SituationInputRequest` 계약으로 검증한 뒤 공통 서버 계층으로 전달한다.
 * 로그인 상태면 httpOnly 쿠키의 access token 을 백엔드에 함께 전달한다(비로그인 허용, issue #135).
 * 비회원 기기 ID 쿠키를 읽거나 발급해 `X-Device-Id` 로 넘긴다 — 코스 만들기 · 다른 코스 보기 횟수를 사람 기준으로 센다(issue #274 · #280).
 * 오류 상태·문구는 `bffErrorResponse` 규칙(백엔드 4xx·503 전달, 그 밖은 502)을 따른다(issue #139 S8).
 */
export async function POST(request: NextRequest) {
  // 입력 검증과 백엔드 호출을 분리한다. 백엔드 응답 계약 불일치(ZodError)를 입력 오류(400)로 오인하지 않기 위함이다.
  const payload = situationInputRequestSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json(
      {
        success: false,
        message: BFF_MESSAGES.situation.invalidInput,
        data: null,
      },
      { status: 400 },
    );
  }

  return respondWithSituationIdentity(
    request,
    (identity) => submitSituation(payload.data, identity),
    BFF_MESSAGES.situation.generateFailed,
  );
}
