import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextTs,
  {
    rules: {
      // 범용 패키지(L1) 경계(issue #381). 실제 resolve 검사는 tooling/ui-guard(boundaries)가 함께 한다.
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "^@/",
          message: "범용 패키지는 앱 코드(@/…)를 import 하지 않습니다. 패키지 안은 상대 경로로 import 합니다.",
        }, {
          regex: "^@dayro/|^dayro-(?:frontend|admin)(?:/|$)|(?:^|/)apps/",
          message: "범용 패키지는 앱 · 자기 패키지 이름을 import 하지 않습니다.",
        }, {
          regex: "^(?:next/headers|next/server|server-only)$",
          message: "범용 패키지는 서버 전용 모듈을 쓰지 않습니다(두 앱의 클라이언트 · 서버 어디서나 쓰여야 합니다).",
        }],
      }],
    },
  },
  globalIgnores(["node_modules/**"]),
]);

export default eslintConfig;
