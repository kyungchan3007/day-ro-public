import { defineConfig } from "vitest/config";

// 순수 로직 · 마크업 문자열 테스트만 둔다. 브라우저 렌더 검증은 web 스토리북 vitest 프로젝트가 패키지 스토리까지 실행한다.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
