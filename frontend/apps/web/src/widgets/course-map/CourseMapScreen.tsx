"use client";

import { BottomActionBar } from "@/shared/ui";
import { Button } from "@dayro/ui";
import {
  SaveCourseSheet,
  useCourseMapScreen,
} from "@/features/course-map";
import { AccountNavBar } from "@/features/auth";
import { CoursePreviewScreen } from "@/widgets/course-preview";
import { courseMapStatic } from "@/shared/static/course-map";
import type { PlaceCandidate, SituationAnswers } from "@/features/situation";

export interface CourseMapScreenProps {
  /** 메뉴 로그인 직전 호출(흐름 스냅샷 인계, issue #181). */
  onBeforeLogin?: () => void;
  places: PlaceCandidate[];
  answers: SituationAnswers;
  onBack?: () => void;
}

/**
 * 확정 코스(지도 + 경로) 화면 (widgets/course-map).
 *
 * feature 훅(useCourseMapScreen)이 준비한 상태와 액션을 받아,
 * 지도/장소 리스트/저장 시트/CTA 를 화면에 조합만 한다.
 */
export function CourseMapScreen({
  places,
  answers,
  onBack,
  onBeforeLogin,
}: CourseMapScreenProps) {
  const {
    places: orderedPlaces,
    isEmpty,
    points,
    isReordered,
    reorder,
    resetOrder,
    sheetOpen,
    toast,
    openSaveSheet,
    closeSaveSheet,
    submitSaveSheet,
    startRouteGuide,
  } = useCourseMapScreen(places, answers);

  return (
    <CoursePreviewScreen
      nav={<AccountNavBar onBack={onBack} onBeforeLogin={onBeforeLogin} />}
      places={orderedPlaces}
      points={points}
      isEmpty={isEmpty}
      isReordered={isReordered}
      onReorder={reorder}
      onResetOrder={resetOrder}
      footer={
        <BottomActionBar>
          <Button
            variant="tonal"
            size="lg"
            fullWidth
            onClick={openSaveSheet}
            disabled={isEmpty}
          >
            {courseMapStatic.screen.saveCta}
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={startRouteGuide}
            disabled={isEmpty}
          >
            {courseMapStatic.screen.routeGuideCta}
          </Button>
        </BottomActionBar>
      }
      overlay={
        <SaveCourseSheet
          open={sheetOpen}
          onClose={closeSaveSheet}
          onSubmit={submitSaveSheet}
        />
      }
      toast={toast}
    />
  );
}
