import { pickApiMessage } from "../../../shared/api/api-error-message";
import { requestBff } from "../../../shared/api/bff-client";
import {
  BFF_ENDPOINTS,
  buildSituationRetryEndpoint,
} from "../../../shared/api/endpoints";
import {
  courseCandidateResponseSchema,
  type CourseCandidateResponse,
  type SituationInputRequest,
} from "../../../shared/api/openapi/dayro.openapi";
import { CourseCandidatesRequestError } from "../model/generation-failure";

/** 서버 문구로 인정하는 최대 길이. 그보다 길면 HTML 등 예상 밖 본문으로 보고 버린다. */
const MAX_SERVER_MESSAGE_LENGTH = 200;

/**
 * 실패 응답을 코스 생성 예외로 바꾸는 변환을 만든다.
 * 본문이 JSON 이면 `message`(1~200자 문자열)만 서버 문구로 채택한다. HTML 차단 페이지 · 빈 본문은 문구 없음.
 * @param code 예외 message 로 쓸 코드.
 * @returns `requestBff` 의 `toError`.
 */
function toRequestError(code: string) {
  return (status: number, body: unknown) =>
    new CourseCandidatesRequestError(
      code,
      status,
      pickApiMessage(body, { trimNonBlank: true, maxLength: MAX_SERVER_MESSAGE_LENGTH }),
    );
}

export async function requestCourseCandidates(
  request: SituationInputRequest,
): Promise<CourseCandidateResponse> {
  return requestBff(
    BFF_ENDPOINTS.situations,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
    {
      schema: courseCandidateResponseSchema,
      toError: toRequestError("course_candidates_failed"),
    },
  );
}

export async function requestRetriedCourseCandidates(
  requestId: string,
): Promise<CourseCandidateResponse> {
  return requestBff(
    buildSituationRetryEndpoint(requestId),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    },
    {
      schema: courseCandidateResponseSchema,
      toError: toRequestError("course_candidates_retry_failed"),
    },
  );
}
