/**
 * course-map 좁은 공개 진입점 — 지도 리소스 힌트 (issue #260).
 * 기본 배럴(`@/features/course-map`)은 지도 · 저장 UI 클라이언트 컴포넌트 묶음이라, 서버 라우트에서는 이 진입점을 쓴다.
 */
export { KakaoMapResourceHints } from "./ui/KakaoMapResourceHints";
