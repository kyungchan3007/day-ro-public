/**
 * 범용 UI 훅 공개 경로 (`@dayro/ui/hooks`, issue #381).
 * 앱의 화면 틀(SideMenu · BottomSheet)과 표현 컴포넌트가 같은 동작을 복사하지 않고 쓰도록 공개한다.
 * 모두 클라이언트 훅이다(각 파일에 "use client"). focus-trap 같은 세부 구현은 공개하지 않는다.
 */
export { useControllableState } from "../lib/useControllableState";
export { useIsClient } from "../lib/useIsClient";
export { useModalDialog } from "../lib/useModalDialog";
export type { UseModalDialogOptions } from "../lib/useModalDialog";
export { useSheetDialog } from "../lib/useSheetDialog";
export type { UseSheetDialogOptions, UseSheetDialogValue } from "../lib/useSheetDialog";
