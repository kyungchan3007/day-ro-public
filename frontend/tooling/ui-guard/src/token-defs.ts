/**
 * CSS 토큰 정의 · 참조 추출 (issue #381).
 * 토큰 = 디자인 값 namespace 의 custom property. 컴포넌트 안 지역 변수(--sheet-offset 등)는 토큰이 아니다.
 */
import { stripComments } from "./token-rules";

export const TOKEN_NAME = /^--(?:color|text|radius|shadow|duration|ease|delay|container|z|font|spacing|breakpoint|leading|tracking)-[a-z0-9-]+$/;

/** 선언된 custom property 이름(주석 제외). */
export function definedProperties(css: string): string[] {
  const clean = stripComments(css, true);
  return [...clean.matchAll(/(?:^|[{;\s])(--[a-zA-Z0-9-]+)\s*:/g)].map((match) => match[1]);
}

export function definedTokens(css: string): string[] {
  return definedProperties(css).filter((name) => TOKEN_NAME.test(name));
}

/** `var(--x)` 로 참조한 이름(CSS · 스크립트 공통, 주석 제외). Tailwind 임의값 `(--x)` 도 포함. */
export function referencedProperties(source: string, isCss: boolean): string[] {
  const clean = stripComments(source, isCss);
  const names = new Set<string>();
  for (const match of clean.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) names.add(match[1]);
  if (!isCss) for (const match of clean.matchAll(/[\w-]+-\((--[a-zA-Z0-9-]+)\)/g)) names.add(match[1]);
  return [...names];
}

/** Tailwind 가 스스로 정의하는 변수. */
export function isTailwindInternal(name: string): boolean {
  return name.startsWith("--tw-");
}
