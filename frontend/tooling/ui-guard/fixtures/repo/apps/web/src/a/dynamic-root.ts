// 실패 fixture: 범용 배럴 동적 로드는 이름 단위 규칙을 우회한다
export const lazy = () => import("@dayro/ui").then((ui) => ui.BottomSheet);
export const sync = () => require("@dayro/ui").BottomSheet;
