/**
 * 홈 목적 바로가기 → 상황 입력 전달값 (issue #332).
 * 목적은 사용자 활동 정보라 주소에 싣지 않고(ADR-26), 같은 탭의 sessionStorage 로 한 번만 넘긴다.
 * 값 검증은 받는 쪽(situation)이 맡는다.
 */
const STORAGE_KEY = "dayro:course-purpose-preset";
/** 홈을 거치지 않고 다른 경로로 들어오는 경우의 안전장치. 오래 지난 값은 적용하지 않는다. */
const MAX_AGE_MS = 30 * 60 * 1000;

/** 목적을 맡긴다(브라우저 전용). 저장소가 막혀 있으면 미리 선택 없이 진행한다. */
export function writeCoursePurposePreset(purpose: string, now = Date.now()): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ purpose, at: now }));
  } catch {
    // 저장소 차단: 미리 선택만 빠진다.
  }
}

/** 맡긴 목적을 버린다. 홈으로 돌아왔다면 바로가기를 취소한 것으로 본다. */
export function clearCoursePurposePreset(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소 차단: 지울 값도 없다.
  }
}

/** 맡긴 목적을 꺼내고 지운다. 없거나 만료 · 손상이면 null. */
export function takeCoursePurposePreset(now = Date.now()): string | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { purpose, at } = parsed as { purpose?: unknown; at?: unknown };
    if (typeof purpose !== "string" || typeof at !== "number" || now - at > MAX_AGE_MS) return null;
    return purpose;
  } catch {
    return null;
  }
}
