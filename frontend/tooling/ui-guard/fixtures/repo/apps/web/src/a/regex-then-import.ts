// 실패 fixture: 정규식 뒤 동적 import 도 잡는다
const r = /https?:\/\//;
export const lazy = () => import("dayro-admin");
export { r };
