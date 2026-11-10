/**
 * 빌드 산출 CSS 변수 보존 검사 (issue #381, SDD 6절).
 * 런타임 코드가 참조하는 변수(CSS 의 var() + TSX inline style · SVG 속성 · 문자열 안 var())가
 * 빌드 CSS 에 정의돼 있는지 본다 → Tailwind 가 "안 쓰는 theme 변수" 로 지운 토큰을 inline · SVG 가 쓰면 잡힌다.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

import { listFiles } from "./targets";
import { definedProperties, isTailwindInternal, referencedProperties } from "./token-defs";
import { stripComments } from "./token-rules";

/** 스크립트에서 객체 속성으로 정의한 custom property(`{ "--x": … }`) — AST 로 읽어 주석 · 문자열 예시는 뺀다. */
export function inlineDefinedProperties(file: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false, /x$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const names: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name)) && node.name.text.startsWith("--")) {
      names.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return names;
}

/** 런타임 소스(테스트 · 스토리 · e2e · 타입 선언 제외). */
export function isRuntimeSource(file: string): boolean {
  if (!/\.(tsx?|jsx?)$/.test(file) || file.endsWith(".d.ts")) return false;
  if (/\.(test|spec|stories)\.[jt]sx?$/.test(file)) return false;
  return !/(^|[/\\])(e2e|e2e-video|e2e-vr|mocks|stories)[/\\]/.test(file);
}

export interface BuiltCssInput {
  /** 빌드 CSS 원문들. */
  css: string[];
  /** 런타임 소스(경로 → 원문). */
  sources: Record<string, string>;
  /** 외부에서 주입되는 변수(next/font 등). */
  external?: string[];
}

export interface MissingVariable {
  name: string;
  /** 참조한 곳(CSS 또는 소스 경로). */
  from: string[];
}

export function findMissingVariables({ css, sources, external = [] }: BuiltCssInput): MissingVariable[] {
  // 정의 · 참조 모두 같은 주석 정책(주석 제외)으로 읽는다.
  const joined = stripComments(css.join("\n"), true);
  const defined = new Set([...definedProperties(joined), ...external]);
  for (const match of joined.matchAll(/@property\s+(--[\w-]+)/g)) defined.add(match[1]);
  // 컴포넌트가 inline style 로 넣는 지역 변수(style={{ "--x": … }})는 정의로 본다.
  for (const [file, source] of Object.entries(sources)) {
    for (const name of inlineDefinedProperties(file, source)) defined.add(name);
  }

  const missing = new Map<string, Set<string>>();
  const note = (name: string, from: string) => {
    if (defined.has(name) || isTailwindInternal(name)) return;
    missing.set(name, (missing.get(name) ?? new Set()).add(from));
  };
  // CSS: 대체값 없는 var() 만(대체값이 있으면 빠져도 깨지지 않는다).
  for (const match of joined.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) if (!match[2]) note(match[1], "built css");
  for (const [file, source] of Object.entries(sources)) {
    for (const name of referencedProperties(source, false)) note(name, file);
  }
  return [...missing].map(([name, from]) => ({ name, from: [...from].sort() })).sort((a, b) => a.name.localeCompare(b.name));
}

/** 앱의 실제 빌드 산출물로 검사 입력을 만든다. 빌드가 없으면 null. */
export function builtCssInputFor(appRoot: string, packageSrc: string): BuiltCssInput | null {
  const cssFiles = listFiles(path.join(appRoot, ".next/static")).filter((file) => file.endsWith(".css"));
  if (cssFiles.length === 0) return null;
  const sources: Record<string, string> = {};
  for (const file of [...listFiles(path.join(appRoot, "src")), ...listFiles(packageSrc)].filter(isRuntimeSource)) {
    sources[path.relative(appRoot, file)] = readFileSync(file, "utf8");
  }
  const ownersFile = path.join(appRoot, "ui-owners.json");
  const owners = existsSync(ownersFile) ? (JSON.parse(readFileSync(ownersFile, "utf8")) as { externalVariables?: Record<string, string> }) : {};
  return { css: cssFiles.map((file) => readFileSync(file, "utf8")), sources, external: Object.keys(owners.externalVariables ?? {}) };
}
