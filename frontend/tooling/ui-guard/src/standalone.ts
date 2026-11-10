/**
 * 범용 패키지(L1) 독립성 검사 (issue #381, SDD 6절 "L1 독립 소비 증거").
 * 패키지 소스의 Tailwind class 가 L1 theme 만으로 같은 CSS 를 만드는지 본다.
 * → 앱 토큰(max-w-app · bg-frame 등)에 기대는 class 는 "L1 theme 만" 에선 CSS 가 없거나 달라져 잡힌다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";

export type DesignSystem = Awaited<ReturnType<typeof __unstable__loadDesignSystem>>;

/** CSS 파일 하나(Tailwind import 포함)를 디자인 시스템으로 읽는다. */
export function loadDesignSystem(cssFile: string): Promise<DesignSystem> {
  return __unstable__loadDesignSystem(readFileSync(cssFile, "utf8"), { base: path.dirname(cssFile) });
}

/** L1 theme 만 쓰는 디자인 시스템. */
export function loadL1DesignSystem(themeFile: string): Promise<DesignSystem> {
  return __unstable__loadDesignSystem(`@import "tailwindcss";\n@import "${themeFile}";`, { base: path.dirname(themeFile) });
}

/** 디렉터리 아래 소스의 class 후보. */
export function scanCandidates(dir: string): string[] {
  return new Scanner({ sources: [{ base: dir, pattern: "**/*", negated: false }] }).scan();
}

/** 문자열 소스의 class 후보(fixture 용). */
export function scanContent(content: string, extension = "tsx"): string[] {
  return new Scanner({}).scanFiles([{ content, extension }]);
}

/**
 * L1 만으로는 CSS 가 없거나 다르게 나오는 class(= 앱 토큰 의존).
 * 두 디자인 시스템 어디서도 CSS 가 안 나오는 후보(일반 단어)는 무시한다.
 */
export function appDependentCandidates(candidates: string[], l1: DesignSystem, app: DesignSystem): string[] {
  const unique = [...new Set(candidates)].sort();
  const base = l1.candidatesToCss(unique);
  const withApp = app.candidatesToCss(unique);
  return unique.filter((_, index) => withApp[index] !== null && withApp[index] !== base[index]);
}

const UTILITY = /^(?:[\w-]+:)*!?(?:bg|text|border(?:-[trblxyse])?|ring|outline|fill|stroke|from|to|via|divide|placeholder|decoration|caret|accent|shadow|rounded(?:-[trblse]{1,2})?)-([a-z][a-z0-9-]*)(?:\/[\w.]+)?$/;

/**
 * 토큰 이름을 쓴 것 같은데 CSS 가 안 나오는 class(= 정의되지 않은 토큰).
 * 예: 토큰을 지웠는데 `hover:bg-surface-muted` 가 남으면 Tailwind 는 조용히 무시한다 → 여기서 잡는다.
 * 토큰 뿌리(surface · primary · danger …)로 시작하는 후보만 본다(일반 단어 오탐 방지).
 */
export function undefinedTokenCandidates(candidates: string[], system: DesignSystem, roots: Set<string>): string[] {
  const unique = [...new Set(candidates)].filter((candidate) => {
    const match = UTILITY.exec(candidate);
    return match !== null && roots.has(match[1].split("-")[0]);
  });
  const css = system.candidatesToCss(unique);
  return unique.filter((_, index) => css[index] === null).sort();
}

/** 토큰 이름들의 뿌리(`--color-surface-subtle` → surface, `--radius-card` → card). */
export function tokenRoots(names: string[]): Set<string> {
  return new Set(
    names
      .map((name) => name.replace(/^--(?:color|radius|shadow|text)-/, ""))
      .filter((rest, index) => rest !== names[index])
      .map((rest) => rest.split("-")[0])
      .filter((root) => !/^[0-9]/.test(root)),
  );
}
