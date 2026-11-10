// 성공 fixture: 공개 경로 · 앱 alias · 앱 안 상대
import { tokens } from "@dayro/ui/tokens";
import { a } from "@dayro/ui";
import { b } from "@/shared/ui";
import { c } from "./bad";
export { tokens, a, b, c };
// 성공 fixture: 문자열 · 주석 속 import 예시는 import 가 아니다
export const example = `import("dayro-admin")`;
export const quoted = 'require("dayro-admin")';
// import "dayro-admin";
