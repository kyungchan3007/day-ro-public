/**
 * 인증 쿠키 이름·수명 (shared/api).
 * BFF 서버 계층(`server-auth-*`, `server-course`)과 auth feature 가 함께 쓰는 계약이라 shared 에 둔다.
 * auth feature 는 `features/auth/model/oauth.ts`에서 다시 내보낸다.
 */
export const OAUTH_STATE_COOKIE_NAME = "dayro_oauth_state";
/** 로그인 후 돌아갈 내부 경로. OAuth 왕복 동안 서버 httpOnly 쿠키로만 보관한다(issue #131). */
export const OAUTH_NEXT_COOKIE_NAME = "dayro_oauth_next";
export const ACCESS_TOKEN_COOKIE_NAME = "dayro_access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "dayro_refresh_token";

/** 만 14세 이상 체크값. 가입 요청까지 전달하거나 비회원에게 다시 묻지 않는 용도다(issue #324). */
export const AGE_CONFIRMED_COOKIE_NAME = "dayro_age_confirmed";
/** 이 브라우저에서 로그인한 적 있음. 확인 화면을 건너뛸지만 판단하며 증빙이 아니다(issue #324). */
export const MEMBER_SEEN_COOKIE_NAME = "dayro_member_seen";

export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 30;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
export const AGE_CONFIRMED_LOGIN_MAX_AGE_SECONDS = 60 * 10;
export const AGE_CONFIRMED_BROWSE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const MEMBER_SEEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
