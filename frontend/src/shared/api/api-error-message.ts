/**
 * BFF 실패 응답 JSON 에서 사용자용 `message` 문자열만 꺼낸다 (브라우저 · 서버 공용 순수 함수, issue #314).
 * 코스 저장 · 찜 수정 · 찜 삭제 · 코스 생성 요청이 같은 판별을 각자 적던 것을 묶었다.
 */
export interface PickApiMessageOptions {
  /** 앞뒤 공백을 지우고, 비었으면 문구 없음으로 본다. */
  trimNonBlank?: boolean;
  /** 이 길이를 넘으면 HTML 등 예상 밖 본문으로 보고 버린다. */
  maxLength?: number;
}

/**
 * @param json 응답 본문을 파싱한 값.
 * @returns `message` 가 조건에 맞는 문자열이면 그 값, 아니면 undefined.
 */
export function pickApiMessage(json: unknown, options: PickApiMessageOptions = {}): string | undefined {
  if (typeof json !== "object" || json === null || !("message" in json)) {
    return undefined;
  }
  const { message } = json;
  if (typeof message !== "string") {
    return undefined;
  }
  if (options.maxLength !== undefined && message.length > options.maxLength) {
    return undefined;
  }
  if (options.trimNonBlank) {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return message;
}
