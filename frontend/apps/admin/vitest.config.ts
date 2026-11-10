import { defineConfig } from "vitest/config";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
// 단위 테스트(node)에서는 서버 전용 가드를 빈 모듈로 바꾼다(web 과 같은 방식).
const serverOnlyEmpty = path.join(path.dirname(createRequire(import.meta.url).resolve("server-only")), "empty.js");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
      "server-only": serverOnlyEmpty,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
