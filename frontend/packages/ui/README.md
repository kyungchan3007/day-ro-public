# @dayro/ui — 범용 UI (L1)

두 앱(`apps/web` · `apps/admin`)이 **같은 모양 · 같은 의미**로 쓰는 토큰과 기본 요소만 둔다.

## 공개 경로 (package.json `exports` 가 원본)
- `@dayro/ui` — 컴포넌트 배럴
- `@dayro/ui/tokens` — 토큰 카탈로그 데이터(스토리북 Foundations 문서용)
- `@dayro/ui/theme.css` — 범용 토큰. 앱 `globals.css` 에서 `@import "tailwindcss";` 바로 다음에 import
- 그 밖의 경로(`@dayro/ui/src/...`)는 lint · `tooling/ui-guard` 가 막는다

## 넣지 않는 것
- 도메인 용어(코스 · 장소 · 이동수단 · GA4)
- 앱 화면 틀(640px 앱 컬럼 · 헤더 오프셋) → 앱 `src/shared/ui` (L2)
- 라우트 묶음 · 슬라이스만 쓰는 값 → 묶음 · 슬라이스 (L3)
- 앱 코드(`@/…`) · `next/headers` · `next/server`

## 토큰
- 원본: `src/styles/theme.css`, 목록: `src/tokens/catalog.ts` (`tooling/ui-guard` 가 둘이 맞는지 검사)
- theme.css 토큰은 theme.css 안 토큰만 참조한다

## 빌드
- 빌드 없음(JIT 패키지). 앱 `next.config.ts` 의 `transpilePackages: ["@dayro/ui"]` 와 `globals.css` 의 `@source` 로 소비한다.

규칙 원본: `.agents/intent/sdd/2026-11-08-ui-package-layers.md` (PR5 에서 `.agents/guides/ui-layers.md` 로 옮김)
