/**
 * import 경계 검사 (issue #381, SDD 5절 — ESLint 문자열 규칙을 실제 resolve 로 보강).
 * 패키지 ↔ 앱 · 앱 ↔ 앱 · 대상 밖 상대 탈출 · @dayro/ui 비공개 경로 · 서버 전용 모듈
 * + 라우트 묶음 · 슬라이스 · 문서 소비자 규칙(ownership.ts).
 *
 * 잡는 문법: import / export from / type import / import type("x") / import() / require() / CSS @import · @reference
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { checkLayering, resolveInSource } from "./ownership";
import { listFiles, readOwners, relativeTo, targets, type Owners, type Target } from "./targets";

export interface BoundaryViolation {
  file: string;
  specifier: string;
  rule: string;
}

const SCRIPT = /\.(?:tsx?|mts|cts|mjs|cjs|jsx?)$/;
const UI_PACKAGE = "@dayro/ui";
const APP_PACKAGES = ["dayro-frontend", "dayro-admin"];
/** L1 이 import 하면 안 되는 서버 전용 모듈. */
const SERVER_ONLY = /^(?:next\/headers|next\/server|server-only)(?:\/|$)/;

/**
 * CSS `@import` · `@reference` 지정자. 주석 · 문자열 밖의 실제 at-rule 만 읽는다
 * (`content: '@import "x"'` 같은 문자열 예시는 import 가 아니다). 따옴표 · url() · 따옴표 없는 url() 모두.
 */
export function cssImportSpecifiers(source: string): string[] {
  const found: string[] = [];
  let i = 0;
  const readString = (quote: string) => {
    let value = "";
    i += 1;
    while (i < source.length && source[i] !== quote && source[i] !== "\n") {
      if (source[i] === "\\") i += 1;
      value += source[i] ?? "";
      i += 1;
    }
    i += 1;
    return value;
  };
  const skipSpace = () => {
    while (i < source.length && /\s/.test(source[i])) i += 1;
  };
  while (i < source.length) {
    const ch = source[i];
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 2;
    } else if (ch === '"' || ch === "'") {
      readString(ch);
    } else if (ch === "@" && /^@(?:import|reference)\b/.test(source.slice(i, i + 11))) {
      i += source.startsWith("@import", i) ? 7 : 10;
      skipSpace();
      if (source[i] === '"' || source[i] === "'") {
        found.push(readString(source[i]));
      } else if (/^url\(/i.test(source.slice(i, i + 4))) {
        i += 4;
        skipSpace();
        if (source[i] === '"' || source[i] === "'") {
          found.push(readString(source[i]));
        } else {
          let value = "";
          while (i < source.length && source[i] !== ")" && !/\s/.test(source[i])) value += source[i++];
          found.push(value);
        }
      }
    } else {
      i += 1;
    }
  }
  return found;
}

/** 스크립트의 동적 로드(import() · require) 지정자. */
export function dynamicSpecifiers(file: string, source: string): string[] {
  const kind = /\.tsx$|\.jsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false, kind);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (callee.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(callee) && callee.text === "require")) {
        const arg = node.arguments[0];
        if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) found.push(arg.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

/** 파일 안 모든 정적 모듈 지정자. 스크립트는 TypeScript AST 로, CSS 는 주석 · 문자열을 구분해 읽는다. */
export function moduleSpecifiers(file: string, source: string): string[] {
  if (file.endsWith(".css")) return cssImportSpecifiers(source);
  const kind = /\.tsx$|\.jsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, false, kind);
  const found: string[] = [];
  const literal = (node: ts.Node | undefined) => {
    if (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) found.push(node.text);
  };
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) literal(node.moduleSpecifier);
    else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) literal(node.moduleReference.expression);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) literal(node.argument.literal);
    else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const isImport = callee.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(callee) && callee.text === "require";
      if (isImport || isRequire) literal(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...new Set(found)];
}

/** `@dayro/ui` 공개 subpath (package.json exports 원본). */
export function publicSubpaths(root: string): Set<string> {
  const pkg = JSON.parse(readFileSync(path.join(root, "packages/ui/package.json"), "utf8")) as { exports: Record<string, string> };
  return new Set(Object.keys(pkg.exports).map((key) => (key === "." ? UI_PACKAGE : `${UI_PACKAGE}/${key.slice(2)}`)));
}

function inside(dir: string, file: string): boolean {
  const relative = path.relative(dir, file);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/** 지정자 하나의 위반 규칙(없으면 null). */
export function checkSpecifier(target: Target, file: string, specifier: string, exportsSet: Set<string>): string | null {
  if (path.isAbsolute(specifier)) return "absolute-path";
  if (specifier.startsWith(".")) {
    return inside(target.root, path.resolve(path.dirname(file), specifier)) ? null : "escape-target";
  }
  if (specifier.startsWith("@/")) {
    if (!target.alias) return "app-alias-in-package";
    // alias 도 실제 목적지로 풀어 대상 밖(`@/../../admin/...`)으로 나가는지 본다.
    return inside(target.alias, path.resolve(target.alias, specifier.slice(2))) ? null : "escape-target";
  }
  if (specifier === UI_PACKAGE || specifier.startsWith(`${UI_PACKAGE}/`)) {
    if (target.name === "ui") return "self-package-import";
    return exportsSet.has(specifier) ? null : "private-subpath";
  }
  if (APP_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`))) return "cross-app";
  if (target.name === "ui" && SERVER_ONLY.test(specifier)) return "server-only-in-package";
  return null;
}

export function checkBoundaries(root?: string): BoundaryViolation[] {
  const all = targets(root);
  const exportsSet = publicSubpaths(root ?? path.resolve(all[0].root, "../.."));
  return all.flatMap((target) => {
    const owners = readOwners(target);
    return listFiles(target.root)
      .filter((file) => SCRIPT.test(file) || file.endsWith(".css"))
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        const where = `${target.name}:${relativeTo(target.root, file)}`;
        const violations = moduleSpecifiers(file, source).flatMap((specifier) => {
          const rule = checkSpecifier(target, file, specifier, exportsSet) ?? layeringRule(target, owners, file, specifier);
          return rule ? [{ file: where, specifier, rule }] : [];
        });
        // 앱이 범용 배럴을 동적으로 읽으면 이름 단위 import 규칙(BottomSheet 앱 폭 등)을 우회한다.
        if (target.name !== "ui" && SCRIPT.test(file)) {
          for (const specifier of dynamicSpecifiers(file, source)) {
            if (specifier === UI_PACKAGE) violations.push({ file: where, specifier, rule: "dynamic-root-import" });
          }
        }
        return violations;
      });
  });
}

function layeringRule(target: Target, owners: Owners, file: string, specifier: string): string | null {
  if (!owners.routeGroups || !target.alias || !inside(target.src, file)) return null;
  const destination = resolveInSource(target, file, specifier);
  return destination === null ? null : checkLayering(owners, relativeTo(target.src, file), destination);
}
