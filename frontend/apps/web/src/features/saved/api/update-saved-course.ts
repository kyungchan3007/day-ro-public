import { pickApiMessage } from "../../../shared/api/api-error-message";
import { requestBff } from "../../../shared/api/bff-client";
import { BFF_ENDPOINTS } from "../../../shared/api/endpoints";
import {
  courseUpdateResponseSchema,
  type CourseUpdateRequest,
  type CourseUpdateResponse,
} from "../../../shared/api/openapi/dayro.openapi";
import { SavedCourseRequestError } from "./saved-course-request-error";

/**
 * 저장 코스 수정 BFF를 호출해 현재 순서를 사용자 계정에 반영한다.
 */
export async function requestSavedCourseUpdate(
  courseId: string,
  request: CourseUpdateRequest,
): Promise<CourseUpdateResponse> {
  return requestBff(
    `${BFF_ENDPOINTS.courses}/${courseId}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
    {
      schema: courseUpdateResponseSchema,
      toError: (status, body) =>
        new SavedCourseRequestError(status, pickApiMessage(body) ?? "저장한 코스를 수정하지 못했습니다."),
    },
  );
}
