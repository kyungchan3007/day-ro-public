import type { ReactNode } from "react";
import { Toast, type ToastVariant } from "./Toast";

/** 화면이 토스트를 그리는 데 필요한 값 묶음. 훅 → 화면 전달 형태로도 쓴다(issue #354). */
export interface ToastDisplay {
  visible: boolean;
  message: ReactNode | null | undefined;
  variant: ToastVariant | null | undefined;
}

/**
 * 보일 때만 Toast 요소, 아니면 null (issue #229).
 * 화면마다 반복하던 `visible && message && variant ? <Toast/> : null` 조건을 한 곳에 둔다.
 * 컴포넌트가 아니라 함수인 이유: ToastViewport 는 자식 개수로 빈 상태를 판단하므로, 숨김일 때 자식 자체가 null 이어야 한다.
 */
export function renderToast(display: ToastDisplay | undefined): ReactNode {
  return display?.visible && display.message && display.variant ? (
    <Toast message={display.message} variant={display.variant} />
  ) : null;
}
