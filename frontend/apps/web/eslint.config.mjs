// For more info, see https://example.invalid
import storybook from "eslint-plugin-storybook";

import { readFileSync } from "node:fs";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// 코드 전체에 적용하는 금지 규칙. 묶음 · 슬라이스 규칙이 같은 rule 을 덮어쓰므로 항상 함께 넘긴다.
const baseSyntax = [{
        selector: "ImportDeclaration[source.value='zod/mini'] > :matches(ImportSpecifier, ImportDefaultSpecifier)",
        message: "Use import * as z from 'zod/mini'. Importing the named z namespace object retains locales/toJSONSchema in the bundle; named/default imports are prohibited to preserve this convention.",
      }, {
        selector: "ImportDeclaration[source.value='zod/mini'][specifiers.length=0]",
        message: "Use import * as z from 'zod/mini'; side-effect imports do not follow the contract import convention.",
      }, {
        selector: ":matches(ExportNamedDeclaration, ExportAllDeclaration)[source.value='zod/mini']",
        message: "Import zod/mini as a namespace at its use site; re-exports can reintroduce the z namespace object and retain locales/toJSONSchema.",
      }, {
        selector: "ImportExpression[source.value='@dayro/ui']",
        message: "@dayro/ui 배럴은 정적으로 import 합니다(이름 단위 경계 규칙을 동적 import 로 우회하지 않음).",
      }];

const basePatterns = [{
          regex: "^zod(?:$|/(?!mini$|v4/core$|v4/locales/en\\.js$))",
          message: "Use zod/mini for contracts, zod/v4/core for errors, or zod/v4/locales/en.js for the English locale.",
        },
        // UI 3층 경계(issue #381). 실제 resolve 검사는 tooling/ui-guard(boundaries)가 함께 한다.
        {
          regex: "^@dayro/ui/(?!(?:hooks|tokens|theme\\.css)$)",
          message: "@dayro/ui 는 공개 경로(@dayro/ui · @dayro/ui/hooks · @dayro/ui/tokens · @dayro/ui/theme.css)로만 import 합니다(packages/ui/package.json exports).",
        }, {
          regex: "^@dayro/ui$",
          importNames: ["BottomSheet"],
          message: "web 시트는 앱 폭이 들어간 @/shared/ui 의 BottomSheet 를 씁니다.",
        }, {
          regex: "^dayro-admin(?:/|$)|(?:^|/)apps/admin(?:/|$)|^(?:\\.\\./)+admin/",
          message: "web 은 admin 앱 코드를 import 하지 않습니다. 두 앱이 함께 쓰면 packages/ui 로 승격하세요.",
        }, {
          regex: "^@/(?:.*/)?\\.\\.(?:/|$)",
          message: "@/ alias 로 src 밖에 나가지 않습니다(@/../.. 금지).",
        }, {
          regex: "^(?:\\.\\./)+packages/",
          message: "패키지는 상대 경로가 아니라 패키지 이름(@dayro/ui)으로 import 합니다.",
        }];

// UI 소유권(issue #381). 원본은 ui-owners.json, 상대 경로까지 푸는 검사는 tooling/ui-guard(boundaries)가 한다.
const owners = JSON.parse(readFileSync(new URL("./ui-owners.json", import.meta.url), "utf8"));

/** esquery 정규식은 `/` 를 쓸 수 없어 `.` 로 바꾼다. */
const forSelector = (regex) => regex.replaceAll("/", ".");

function restrict(files, regexes, message) {
  return {
    files,
    rules: {
      "no-restricted-imports": ["error", { patterns: [...basePatterns, ...regexes.map((regex) => ({ regex, message }))] }],
      "no-restricted-syntax": ["error", ...baseSyntax, ...regexes.flatMap((regex) => [
        { selector: `ImportExpression[source.value=/${forSelector(regex)}/]`, message },
        { selector: `CallExpression[callee.name='require'][arguments.0.value=/${forSelector(regex)}/]`, message },
      ])],
    },
  };
}

const isFile = (member) => /\.[a-z]+$/.test(member);
const memberGlob = (member) => (isFile(member) ? `src/${member}` : `src/${member}/**`);

const ownershipConfigs = [
  restrict(["src/shared/**", "src/entities/**"], ["^@/(?:groups|features|widgets|app)(?:/|$)"], "shared · entities 는 위 층(groups · features · widgets · app)을 import 하지 않습니다."),
  ...Object.keys(owners.routeGroups).map((group) =>
    restrict([`src/groups/${group}/**`], [`^@/groups(?:$|/(?!${group}(?:/|$)))`, "^@/(?:features|widgets|app)(?:/|$)"], `${group} 묶음은 다른 묶음이나 위 층을 import 하지 않습니다.`)),
  restrict(owners.unownedSlices.map(memberGlob), ["^@/groups(?:/|$)"], "어느 묶음에도 속하지 않는 슬라이스는 묶음 UI 를 쓰지 않습니다(L1 · L2 만)."),
  // 파일 단위 소속이 디렉터리 항목보다 우선하도록 디렉터리 → 파일 순으로 둔다(flat config 는 뒤가 이긴다).
  ...Object.entries(owners.routeGroups)
    .flatMap(([group, members]) => members.map((member) => ({ group, member })))
    .sort((a, b) => Number(isFile(a.member)) - Number(isFile(b.member)))
    .map(({ group, member }) =>
      restrict([memberGlob(member)], [`^@/groups(?!/${group}$)(?:/|$)`], `${member} 는 ${group} 묶음 소속입니다. @/groups/${group} 배럴로만 import 합니다.`)),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-syntax": ["error", ...baseSyntax],
      "no-restricted-imports": ["error", {
        patterns: [...basePatterns],
      }],
    },
  },
  ...ownershipConfigs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // 성능 분석용 빌드 산출물 (PERF_SOURCEMAPS=1, scripts/perf)
    ".next-perf/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    // Cloudflare(OpenNext·wrangler) 빌드 산출물
    ".open-next/**",
    ".wrangler/**",
    "cloudflare-env.d.ts",
    ".claude/skills/**",
    "next-env.d.ts",
    // MSW 생성물(파일 상단 "수정 금지") — 직접 고치지 않고 검사에서 뺀다 (issue #280)
    "public/mockServiceWorker.js",
  ]),
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
