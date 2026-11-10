import { pickApiMessage } from "../../../shared/api/api-error-message";
import { requestBff } from "../../../shared/api/bff-client";
import { BFF_ENDPOINTS } from "../../../shared/api/endpoints";
import {
  courseSaveResponseSchema,
  type CourseSaveRequest,
  type CourseSaveResponse,
} from "../../../shared/api/openapi/dayro.openapi";

export class CourseSaveRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CourseSaveRequestError";
    this.status = status;
  }
}

/**
 * 코스 저장 BFF를 호출해 현재 선택 순서를 사용자 계정에 저장한다.
 */
export async function requestCourseSave(
  request: CourseSaveRequest,
): Promise<CourseSaveResponse> {
  return requestBff(
    BFF_ENDPOINTS.courses,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
    {
      schema: courseSaveResponseSchema,
      toError: (status, body) =>
        new CourseSaveRequestError(status, pickApiMessage(body) ?? "코스 저장에 실패했습니다."),
    },
  );
}
