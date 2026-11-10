/** 저장 코스 수정 · 삭제 BFF 요청이 실패했을 때 던지는 예외. */
export class SavedCourseRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SavedCourseRequestError";
    this.status = status;
  }
}
