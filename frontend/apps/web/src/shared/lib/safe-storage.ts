/** 브라우저 저장소 종류. */
export type SafeStorageArea = "localStorage" | "sessionStorage";

/**
 * 브라우저 저장소 접근(issue #348).
 * 서버 실행 · 저장소 차단 · 용량 초과에도 예외를 던지지 않고 실패 값만 돌려준다.
 * 실패했을 때 무엇을 할지(메모리 폴백 등)는 호출부가 정한다.
 */
export const safeStorage = {
  /** @returns 저장된 값. 없거나 읽을 수 없으면 null. */
  read(area: SafeStorageArea, key: string): string | null {
    try {
      return window[area].getItem(key);
    } catch {
      return null;
    }
  },

  /** @returns 기록했으면 true, 실패하면 false. */
  write(area: SafeStorageArea, key: string, value: string): boolean {
    try {
      window[area].setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  /** 직렬화까지 함께 보호하는 `write`. @returns 기록했으면 true, 직렬화 · 기록에 실패하면 false. */
  writeJson(area: SafeStorageArea, key: string, value: unknown): boolean {
    try {
      window[area].setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /** @returns 지웠으면(원래 없던 값 포함) true, 실패하면 false. */
  remove(area: SafeStorageArea, key: string): boolean {
    try {
      window[area].removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
