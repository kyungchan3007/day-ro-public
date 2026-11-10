import { BFF_ENDPOINTS } from "@/shared/api/endpoints";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AGE_CONFIRMED_COOKIE_NAME,
  MEMBER_SEEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/shared/api/auth-cookies";
import { encodeNextPathParam } from "@/shared/lib/next-path-param";

/**
 * 만 14세 확인 게이트 규칙 (issue #324).
 *
 * 카카오 로그인 전에는 사용자를 알 수 없으므로 브라우저 신호로만 판단한다.
 * 증빙은 백엔드 저장값이고, 쿠키는 체크값 전달 · 표시 판단에만 쓴다.
 */
export const AGE_CHECK_PATH = "/age-check";
/** 카카오 시작 경로에서 "이미 회원이에요"를 나타내는 쿼리. 신규 회원은 백엔드가 거절한다. */
export const AGE_CHECK_ENTRY_PARAM = "entry";
export const AGE_CHECK_MEMBER_ENTRY = "member";

export type AgeCheckIntent = "login" | "browse";
export type AgeCheckAnswer = "14_or_older" | "under_14";
export type AgeCheckResult = "under14";
export type AgeCheckNotice = "confirm_required";

export interface AgeCheckSignals {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasMemberSeen: boolean;
  hasAgeConfirmed: boolean;
}

/** `NextRequest.cookies` · `cookies()` 가 공통으로 가진 읽기 형태. */
interface CookieReader {
  get(name: string): { value: string } | undefined;
}

/** 쿠키에서 확인 화면 판단에 쓰는 신호를 읽는다. */
export function readAgeCheckSignals(cookies: CookieReader): AgeCheckSignals {
  return {
    hasAccessToken: Boolean(cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value),
    hasRefreshToken: Boolean(cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value),
    hasMemberSeen: cookies.get(MEMBER_SEEN_COOKIE_NAME)?.value === "1",
    hasAgeConfirmed: cookies.get(AGE_CONFIRMED_COOKIE_NAME)?.value === "1",
  };
}

/** 세션 · 로그인 표시 · 체크값이 모두 없을 때만 확인 화면을 보여 준다. */
export function needsAgeCheck(signals: AgeCheckSignals): boolean {
  return !(
    signals.hasAccessToken ||
    signals.hasRefreshToken ||
    signals.hasMemberSeen ||
    signals.hasAgeConfirmed
  );
}

/** 쿼리 값을 intent 로 읽는다. 모르는 값은 카카오로 보내지 않도록 둘러보기로 본다. */
export function parseAgeCheckIntent(value: unknown): AgeCheckIntent {
  return value === "login" ? "login" : "browse";
}

/** 제출 값을 답변으로 읽는다. 모르는 값은 null. */
export function parseAgeCheckAnswer(value: unknown): AgeCheckAnswer | null {
  return value === "14_or_older" || value === "under_14" ? value : null;
}

/** 쿼리 · 제출 값을 안내 상태로 읽는다. 모르는 값은 undefined. */
export function parseAgeCheckNotice(value: unknown): AgeCheckNotice | undefined {
  return value === "confirm_required" ? value : undefined;
}

export interface AgeCheckPathOptions {
  intent: AgeCheckIntent;
  next?: string | null;
  result?: AgeCheckResult;
  notice?: AgeCheckNotice;
}

/** 확인 화면 주소를 만든다. `next` 는 호출 전에 검증된 내부 경로여야 한다. */
export function buildAgeCheckPath({ intent, next, result, notice }: AgeCheckPathOptions): string {
  const query = new URLSearchParams({ intent });
  if (next) query.set("next", next);
  if (result) query.set("result", result);
  if (notice) query.set("notice", notice);
  return `${AGE_CHECK_PATH}?${query}`;
}

/** 카카오 시작 경로. Route Handler 로 가는 값이라 next 를 base64url 로 감싼다(issue #200). */
function buildKakaoStartPath(next: string | null | undefined, memberEntry: boolean): string {
  const query = new URLSearchParams();
  if (memberEntry) query.set(AGE_CHECK_ENTRY_PARAM, AGE_CHECK_MEMBER_ENTRY);
  if (next) query.set("next", encodeNextPathParam(next));
  const search = query.toString();
  return search ? `${BFF_ENDPOINTS.authKakaoStart}?${search}` : BFF_ENDPOINTS.authKakaoStart;
}

/** 확인을 통과한 뒤 갈 곳. 로그인은 카카오, 둘러보기는 원래 가던 곳 또는 온보딩. */
export function buildAgeCheckPassPath(intent: AgeCheckIntent, next: string | null | undefined): string {
  if (intent === "login") return buildKakaoStartPath(next, false);
  return next ?? "/onboarding";
}

/** "이미 회원이에요" 경로. 확인값 없이 카카오로 보내고 신규 여부는 백엔드가 판단한다. */
export function buildAlreadyMemberPath(next: string | null | undefined): string {
  return buildKakaoStartPath(next, true);
}

/** 페이지 searchParams 를 다시 주소로 만든다(복귀 경로용). */
export function buildPathWithQuery(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) query.append(key, item);
    }
  }
  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}
