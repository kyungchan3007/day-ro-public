/**
 * UI 소유권 규칙 (issue #381, SDD 2 · 4 · 5절).
 * 원본은 앱의 ui-owners.json. 디렉터리 이름 · URL 로 소속을 추측하지 않는다.
 *
 * - import: shared · entities → 위 층 금지 / 묶음 → 다른 묶음 · 위 층 금지 / 묶음 밖 → `@/groups/<묶음>` 루트만
 * - 토큰: 묶음 토큰은 그 묶음에서만, 슬라이스 토큰은 그 슬라이스에서만
 * - tokens.css 는 app/globals.css 만 import
 */
import path from "node:path";

import { isRuntimeSource } from "./built-css";
import type { Owners, Target } from "./targets";
import { stripComments } from "./token-rules";

const ASSEMBLY = "app/globals.css";

type Scope =
  | { kind: "group"; group: string }
  | { kind: "member"; group: string }
  | { kind: "unowned" }
  | { kind: "lower" }
  | { kind: "other" };

function underDirectory(file: string, directory: string): boolean {
  return file === directory || file.startsWith(`${directory}/`);
}

/** src 기준 파일의 소유 범위. 파일 항목 → 디렉터리 항목 순으로 찾는다. */
export function scopeOf(file: string, owners: Owners): Scope {
  if (file.startsWith("groups/")) return { kind: "group", group: file.split("/")[1] };
  const entries = Object.entries(owners.routeGroups ?? {}).flatMap(([group, members]) => members.map((member) => ({ group, member })));
  const exact = entries.find(({ member }) => member === file);
  if (exact) return { kind: "member", group: exact.group };
  const directory = entries.find(({ member }) => underDirectory(file, member));
  if (directory) return { kind: "member", group: directory.group };
  if ((owners.unownedSlices ?? []).some((slice) => underDirectory(file, slice))) return { kind: "unowned" };
  if (file.startsWith("shared/") || file.startsWith("entities/")) return { kind: "lower" };
  return { kind: "other" };
}

/** 지정자를 src 기준 경로로 푼다(확장자 · /index 제거). 앱 소스 밖이면 null. */
export function resolveInSource(target: Target, file: string, specifier: string): string | null {
  let absolute: string;
  if (specifier.startsWith("@/") && target.alias) absolute = path.resolve(target.alias, specifier.slice(2));
  else if (specifier.startsWith(".")) absolute = path.resolve(path.dirname(file), specifier);
  else return null;
  const relative = path.relative(target.src, absolute).split(path.sep).join("/");
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return relative.replace(/\.(?:tsx?|jsx?)$/, "").replace(/\/index$/, "");
}

function isDocumentPath(file: string): boolean {
  return /\.stories$/.test(file) || /(^|\/)stories\//.test(file) || underDirectory(file, "app/ui-preview");
}

/** 소비 파일 → 목적지 하나의 위반 규칙(없으면 null). 두 인자 모두 src 기준. */
export function checkLayering(owners: Owners, consumer: string, destination: string): string | null {
  if (path.posix.basename(destination) === "tokens.css") {
    return consumer === ASSEMBLY ? null : "token-import-outside-assembly";
  }
  if (isDocumentPath(destination) && isRuntimeSource(consumer) && !underDirectory(consumer, "app/ui-preview")) {
    return "runtime-imports-docs";
  }

  const [layer, name] = destination.split("/");
  const scope = scopeOf(consumer, owners);
  const upper = layer === "features" || layer === "widgets" || layer === "app";

  if (scope.kind === "lower") {
    // shared/api 계약 테스트가 BFF 라우트 핸들러를 실제로 호출한다. UI 소유권과 무관한 테스트 전용 예외.
    if (consumer.startsWith("shared/api/") && /\.test\.tsx?$/.test(consumer) && destination.startsWith("app/api/")) return null;
    return upper || layer === "groups" ? "lower-imports-upper" : null;
  }
  if (scope.kind === "group") {
    if (upper) return "group-imports-upper";
    if (layer === "groups" && name !== scope.group) return "foreign-group";
    return null;
  }
  if (layer !== "groups") return null;
  if (scope.kind === "unowned") return "foreign-group";
  if (scope.kind === "member" && name !== scope.group) return "foreign-group";
  return destination === `groups/${name}` ? null : "group-deep-import";
}

export type TokenOwner = { kind: "app" } | { kind: "group"; group: string } | { kind: "slice"; slice: string };

/** 토큰 원본 파일의 소유자. 정해진 위치가 아니면 null. */
export function tokenOwnerOf(file: string): TokenOwner | null {
  if (file === ASSEMBLY) return { kind: "app" };
  const group = /^groups\/([^/]+)\/tokens\.css$/.exec(file);
  if (group) return { kind: "group", group: group[1] };
  const slice = /^((?:features|widgets)\/[^/]+)\/css\/tokens\.css$/.exec(file);
  return slice ? { kind: "slice", slice: slice[1] } : null;
}

function canUse(owner: TokenOwner, consumer: string, owners: Owners): boolean {
  if (owner.kind === "app") return true;
  if (owner.kind === "slice") return underDirectory(consumer, owner.slice);
  const scope = scopeOf(consumer, owners);
  return (scope.kind === "group" || scope.kind === "member") && scope.group === owner.group;
}

/** Tailwind v4 에서 색 토큰을 받는 유틸 전체. */
const COLOR_UTILITIES = "(?:bg|text|text-shadow|border(?:-[trblxyse])?|ring|ring-offset|inset-ring|inset-shadow|outline|fill|stroke|from|to|via|divide|placeholder|decoration|caret|accent|shadow|drop-shadow)";

/** 토큰을 가리키는 표기(`--x` 자체 + Tailwind 유틸). */
export function tokenUsagePattern(name: string): RegExp {
  const escaped = name.replace(/[-]/g, "\\-");
  const forms = [escaped];
  const match = /^--(color|text|radius|shadow)-(.+)$/.exec(name);
  if (match) {
    const tail = match[2];
    forms.push(
      { color: `${COLOR_UTILITIES}-${tail}`, text: `text-${tail}`, radius: `rounded(?:-[trblse]{1,2})?-${tail}`, shadow: `shadow-${tail}` }[match[1] as "color" | "text" | "radius" | "shadow"],
    );
  }
  return new RegExp(`(?<![\\w-])(?:${forms.join("|")})(?![\\w-])`);
}

export function isDocumentConsumer(file: string, owners: Owners): boolean {
  return (owners.docs ?? []).some(({ path: entry }) =>
    entry.endsWith("/**") ? underDirectory(file, entry.slice(0, -3)) : entry === file,
  );
}

export interface TokenScopeInput {
  owners: Owners;
  /** 토큰 원본 파일 → 정의한 토큰 이름. */
  tokens: Record<string, string[]>;
  /** src 기준 파일 → 원문. */
  sources: Record<string, string>;
}

/** 소유 범위 밖에서 쓴 토큰 (`파일 → 토큰 (소유: 원본)`). 토큰 원본 파일끼리의 참조도 본다. */
export function findTokenScopeViolations({ owners, tokens, sources }: TokenScopeInput): string[] {
  const scoped = Object.entries(tokens).flatMap(([file, names]) => {
    const owner = tokenOwnerOf(file);
    return owner && owner.kind !== "app" ? names.map((name) => ({ name, file, owner, pattern: tokenUsagePattern(name) })) : [];
  });
  return Object.entries(sources).flatMap(([file, source]) => {
    if (isDocumentConsumer(file, owners)) return [];
    const clean = stripComments(source, file.endsWith(".css"));
    return scoped
      .filter(({ owner, pattern, file: origin }) => origin !== file && !canUse(owner, file, owners) && pattern.test(clean))
      .map(({ name, file: origin }) => `${file} → ${name} (소유: ${origin})`);
  });
}
