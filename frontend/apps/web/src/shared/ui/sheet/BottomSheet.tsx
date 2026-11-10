// web 앱 폭을 넣는 이 파일만 범용 BottomSheet 를 직접 쓴다(issue #381).
// eslint-disable-next-line no-restricted-imports
import { BottomSheet as BaseBottomSheet, type BottomSheetProps as BaseBottomSheetProps } from "@dayro/ui";

import styles from "./css/BottomSheet.module.css";

export type BottomSheetProps = Omit<BaseBottomSheetProps, "panelClassName">;

/** web 바텀시트: 범용 시트 패널(portal)을 AppShell 컬럼 폭에 맞춘다. */
export function BottomSheet(props: BottomSheetProps) {
  return <BaseBottomSheet {...props} panelClassName={styles.panel} />;
}
