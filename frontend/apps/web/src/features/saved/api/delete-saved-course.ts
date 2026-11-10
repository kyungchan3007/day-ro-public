import { pickApiMessage } from "../../../shared/api/api-error-message";
import { requestBff } from "../../../shared/api/bff-client";
import { BFF_ENDPOINTS } from "../../../shared/api/endpoints";
import {
  courseDeleteResponseSchema,
  type CourseDeleteResponse,
} from "../../../shared/api/openapi/dayro.openapi";
import { SavedCourseRequestError } from "./saved-course-request-error";

/** 브라우저에서 saved 소유 BFF만 호출해 저장 코스를 삭제한다. */
export async function requestSavedCourseDelete(
  courseId: string,
): Promise<CourseDeleteResponse> {
  return requestBff(
    `${BFF_ENDPOINTS.courses}/${courseId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
    {
      schema: courseDeleteResponseSchema,
      toError: (status, body) =>
        new SavedCourseRequestError(status, pickApiMessage(body) ?? "저장한 코스를 삭제하지 못했습니다."),
    },
  );
}
