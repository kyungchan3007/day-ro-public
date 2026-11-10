import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 모노레포 경로 기준 (issue #374).
 * - appRoot: 이 앱(`frontend/apps/web`) — Next 빌드 · wrangler · 앱 설정 파일 위치
 * - workspaceRoot: 워크스페이스 루트(`frontend`) — `.agents` 리포트 · `.changeset` · lock 위치
 */
export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const workspaceRoot = resolve(appRoot, "../..");

/** npm workspaces 는 실행 파일을 루트 `node_modules/.bin` 으로 올릴 수 있어 앱 → 루트 순으로 찾는다. */
export function binPath(name) {
  for (const dir of [appRoot, workspaceRoot]) {
    const candidate = join(dir, "node_modules/.bin", name);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`실행 파일을 찾지 못했습니다: ${name} (npm install 을 먼저 실행하세요)`);
}

/** 사용자가 넘긴 상대 경로는 npm 을 실행한 위치(INIT_CWD) 기준으로 푼다 — `-w` 로 실행해도 예전처럼 동작한다. */
export function resolveFromInvocation(path) {
  return resolve(process.env.INIT_CWD ?? process.cwd(), path);
}
