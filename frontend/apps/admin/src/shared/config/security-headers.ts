/**
 * 어드민 보안 응답 헤더 (issue #374).
 * next.config.ts 에서 import 하므로 경로 별칭 · 외부 의존성 없이 순수 값으로 둔다.
 * 어드민은 외부 스크립트(GA 태그 등)를 싣지 않으므로 CSP 를 처음부터 강제한다.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Next App Router 인라인 부트스트랩 스크립트 때문에 'unsafe-inline'(nonce 도입 전까지)
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
];

export const ADMIN_SECURITY_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES.join("; ") },
  // 검색엔진 색인 금지(robots.txt 와 별개로 응답마다)
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cache-Control", value: "private, no-store" },
];
