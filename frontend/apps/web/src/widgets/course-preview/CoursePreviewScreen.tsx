import type { ReactNode } from "react";

import { EmptyState } from "@/groups/course";
import { Container, AppShell, ToastViewport } from "@/shared/ui";
import { Button, RefreshIcon, renderToast, type ToastDisplay } from "@dayro/ui";
import { CourseMap, CoursePlaceList } from "@/features/course-map";
import { AccountNavBar } from "@/features/auth";
import type { CoursePlaceItem, CoursePoint } from "@/shared/lib/course-preview";
import { courseMapStatic } from "@/shared/static/course-map";
import styles from "./css/CoursePreviewScreen.module.css";

export interface CoursePreviewScreenProps {
  nav?: ReactNode;
  places: CoursePlaceItem[];
  points: CoursePoint[];
  isEmpty: boolean;
  isReordered: boolean;
  onReorder: (from: number, to: number) => void;
  onResetOrder: () => void;
  footer: ReactNode;
  overlay?: ReactNode;
  emptyText?: ReactNode;
  listHint?: string;
  toast?: ToastDisplay;
}

/**
 * 공통 코스 프리뷰 화면 셸.
 * 지도, 장소 리스트, 순서 리셋, 토스트 영역을 묶고 footer/nav 정책은 상위 도메인에 연다.
 */
export function CoursePreviewScreen({
  nav,
  places,
  points,
  isEmpty,
  isReordered,
  onReorder,
  onResetOrder,
  footer,
  overlay,
  emptyText,
  listHint = "≡ 를 끌어 순서를 바꿔보세요",
  toast,
}: CoursePreviewScreenProps) {
  return (
    <AppShell
      bleed
      nav={nav ?? <AccountNavBar showBack={false} />}
      footer={footer}
      className="flex flex-col"
    >
      {isEmpty ? (
        <EmptyState
          illustration="place-checklist"
          title={emptyText ?? courseMapStatic.previewEmpty.title}
          description={emptyText == null ? courseMapStatic.previewEmpty.description : undefined}
          className="flex-1 justify-center"
        />
      ) : (
        <>
          <section className={styles.mapSection} aria-label="코스 지도">
            <CourseMap points={points} />
          </section>

          <Container className={styles.listSection}>
            <div className={styles.listHeader}>
              <p className={styles.listHint}>{listHint}</p>
              {isReordered && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshIcon size={15} />}
                  onClick={onResetOrder}
                >
                  원래 순서로
                </Button>
              )}
            </div>
            <CoursePlaceList places={places} onReorder={onReorder} />
          </Container>
        </>
      )}

      {overlay}

      <ToastViewport>
        {renderToast(toast)}
      </ToastViewport>
    </AppShell>
  );
}
