/** 응답 스키마가 갖춰야 할 최소 모양. zod 스키마가 그대로 들어간다. */
interface BffResponseSchema<T> {
  parse: (data: unknown) => T;
}

export interface RequestBffOptions<T> {
  /** 성공 응답을 검증할 스키마. */
  schema: BffResponseSchema<T>;
  /**
   * 실패 응답을 호출부의 예외로 바꾼다.
   * @param status HTTP 상태.
   * @param body 파싱한 본문. JSON 이 아니거나 읽지 못했으면 null.
   */
  toError: (status: number, body: unknown) => Error;
  /**
   * 실패 본문이 필요 없으면 true. 본문을 기다리지 않고 `toError(status, null)` 을 던진다.
   * 끝나지 않는 실패 본문이 로그아웃 · 세션 조회 같은 요청을 붙잡지 않게 한다.
   */
  skipFailureBody?: boolean;
}

/** 본문을 text 로 한 번 읽어 JSON 으로 파싱한다. HTML 차단 페이지 · 빈 본문 · 읽기 실패는 null. */
async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return JSON.parse(await response.text()) as unknown;
  } catch {
    return null;
  }
}

/**
 * 브라우저에서 BFF 를 호출하는 공통 흐름 (issue #350).
 * fetch → 본문 안전 파싱 → ok 검사 → 스키마 검증. fetch 자체의 네트워크 오류는 그대로 전파한다.
 * @param url BFF 경로.
 * @param init fetch 옵션. 그대로 전달한다.
 * @param options 응답 스키마와 실패 변환.
 * @returns 검증한 응답.
 * @throws 실패 응답이면 `toError` 결과, 성공 본문이 계약과 다르면 스키마 오류.
 */
export async function requestBff<T>(
  url: string,
  init: RequestInit,
  { schema, toError, skipFailureBody = false }: RequestBffOptions<T>,
): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok && skipFailureBody) {
    throw toError(response.status, null);
  }

  const body = await readJsonBody(response);

  if (!response.ok) {
    throw toError(response.status, body);
  }

  return schema.parse(body);
}
