import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // UI 3층 경계(issue #374 · #381). 실제 resolve 검사는 tooling/ui-guard(boundaries)가 함께 한다.
      "no-restricted-imports": ["error", {
        patterns: [{
          regex: "^dayro-frontend(?:/|$)|(?:^|/)apps/web(?:/|$)|^(?:\\.\\./)+web/",
          message: "admin 은 web 앱 코드를 import 하지 않습니다. 두 앱이 함께 쓰면 packages/ui 로 승격하세요.",
        }, {
          regex: "^@dayro/ui/(?!(?:hooks|tokens|theme\\.css)$)",
          message: "@dayro/ui 는 공개 경로(@dayro/ui · @dayro/ui/hooks · @dayro/ui/tokens · @dayro/ui/theme.css)로만 import 합니다(packages/ui/package.json exports).",
        }, {
          regex: "^@/(?:.*/)?\\.\\.(?:/|$)",
          message: "@/ alias 로 src 밖에 나가지 않습니다(@/../.. 금지).",
        }, {
          regex: "^(?:\\.\\./)+packages/",
          message: "패키지는 상대 경로가 아니라 패키지 이름(@dayro/ui)으로 import 합니다.",
        }],
      }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", ".open-next/**", ".wrangler/**", "cloudflare-env.d.ts", "next-env.d.ts"]),
]);

export default eslintConfig;
