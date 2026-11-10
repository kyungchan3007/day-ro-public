import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { workspaceRoot } from "./paths.mjs";

// 변경 기록은 워크스페이스 루트(`frontend/.changeset`)에 있다(issue #374).
const defaultDir = join(workspaceRoot, ".changeset");

const listMarkdown = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".md") && name !== "README.md").map((name) => join(dir, name)) : [];

/** 빈 기록 = front matter 에 패키지 항목이 없는 파일 (`npx changeset --empty`). */
export function isEmptyChangeset(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n?---/.exec(content);
  return match !== null && match[1].trim() === "";
}

/**
 * main 릴리스 전 남은 변경 기록을 changesets/action v2 와 같은 기준으로 센다 (issue #300).
 * - 사전 릴리스 모드(mode=pre)면 `pre/` 는 이미 버전에 반영된 기록이라 제외, 그 밖(exit 등)이면 포함
 * - 빈 기록은 버전에 영향이 없다. action 이 빈 기록만 보면 publish 를 건너뛰므로 removeEmpty 로 작업 트리에서 지운다
 */
export function checkReleaseChangesets({ dir = defaultDir, removeEmpty = false } = {}) {
  // 폴더를 못 찾으면 0개로 보고 통과시키지 않는다 — 경로가 틀린 채 릴리스되는 것을 막는다.
  if (!existsSync(dir)) throw new Error(`변경 기록 폴더가 없습니다: ${dir}`);
  const prePath = join(dir, "pre.json");
  const mode = existsSync(prePath) ? JSON.parse(readFileSync(prePath, "utf8")).mode : null;
  const files = [...listMarkdown(dir), ...(mode === "pre" ? [] : listMarkdown(join(dir, "pre")))];
  const empty = [];
  const pending = [];
  for (const file of files) (isEmptyChangeset(readFileSync(file, "utf8")) ? empty : pending).push(file);
  if (removeEmpty) for (const file of empty) rmSync(file);
  return { mode, empty, pending };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { empty, pending } = checkReleaseChangesets({ removeEmpty: process.argv.includes("--remove-empty") });
  if (empty.length > 0) console.log(`빈 변경 기록 ${empty.length}개는 릴리스에서 제외합니다.`);
  if (pending.length > 0) {
    console.error("::error::main 에 버전으로 반영되지 않은 변경 기록이 있습니다. develop 의 Version Packages PR 을 먼저 머지하세요.");
    for (const file of pending) console.error(`- ${file}`);
    process.exit(1);
  }
}
