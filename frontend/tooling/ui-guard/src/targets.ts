/**
 * 검사 대상(UI 소유자) 정의 (issue #381).
 * - ui: 범용 패키지(L1) · web / admin: 앱(L2 이하)
 * 대상마다 `ui-owners.json`(예외 · 소유권 원본)을 가진다.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import type { TokenGuardAllowlist } from "./token-rules";

export type TargetName = "ui" | "web" | "admin";

export interface Target {
  name: TargetName;
  /** 대상 루트(package.json 위치). */
  root: string;
  /** 소스 루트. */
  src: string;
  /** `@/` alias 가 가리키는 곳(앱만). */
  alias?: string;
  /** 토큰 정의 원본 CSS(대상 src 기준). */
  tokenSources: string[];
}

export interface Owners {
  tokenGuard?: { allowlist?: TokenGuardAllowlist };
  /** 런타임에 다른 경로로 들어오는 변수(이름 → 이유). 예: next/font 변수. */
  externalVariables?: Record<string, string>;
  /** 라우트 묶음 → 소속 슬라이스(디렉터리) · 파일. 파일 항목이 디렉터리 항목보다 우선한다. */
  routeGroups?: Record<string, string[]>;
  /** 어느 묶음에도 속하지 않는 슬라이스(묶음 import 금지). */
  unownedSlices?: string[];
  /** 문서 소비자 예외. path 는 정확한 파일 또는 `디렉터리/**`. */
  docs?: { path: string; allow: string; reason: string }[];
}

/** frontend 워크스페이스 루트. */
export const REPO_ROOT = path.resolve(__dirname, "../../..");

export function targets(root: string = REPO_ROOT): Target[] {
  return [
    {
      name: "ui",
      root: path.join(root, "packages/ui"),
      src: path.join(root, "packages/ui/src"),
      tokenSources: ["styles/theme.css"],
    },
    {
      name: "web",
      root: path.join(root, "apps/web"),
      src: path.join(root, "apps/web/src"),
      alias: path.join(root, "apps/web/src"),
      tokenSources: [
        "app/globals.css",
        ...listFiles(path.join(root, "apps/web/src"))
          .filter((file) => path.basename(file) === "tokens.css")
          .map((file) => relativeTo(path.join(root, "apps/web/src"), file))
          .sort(),
      ],
    },
    {
      name: "admin",
      root: path.join(root, "apps/admin"),
      src: path.join(root, "apps/admin/src"),
      alias: path.join(root, "apps/admin/src"),
      tokenSources: ["app/globals.css"],
    },
  ];
}

export function readOwners(target: Target): Owners {
  const file = path.join(target.root, "ui-owners.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Owners) : {};
}

const SKIP_DIRS = new Set(["node_modules", ".open-next", ".wrangler", "storybook-static", "out", "build"]);
/** 소스 검사에서 빼는 빌드 산출 디렉터리(산출물 검사는 이 목록을 우회해 직접 읽는다). */
const BUILD_DIRS = new Set([".next"]);

/** 디렉터리 아래 모든 파일(절대 경로). */
export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const insideBuild = dir.split(path.sep).some((part) => BUILD_DIRS.has(part));
  return readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name) || (!insideBuild && BUILD_DIRS.has(name))) return [];
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

/** src 기준 상대 경로(슬래시). */
export function relativeTo(base: string, file: string): string {
  return path.relative(base, file).split(path.sep).join("/");
}
