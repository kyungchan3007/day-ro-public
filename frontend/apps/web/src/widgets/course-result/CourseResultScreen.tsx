"use client";

import { Button, cn, renderToast, type ToastDisplay } from "@dayro/ui";
import { SelectablePlaceCard, CourseOrderStrip, EmptyState } from "@/groups/course";
import { AppShell, BottomActionBar, Container } from "@/shared/ui/layout";
import { ToastViewport } from "@/shared/ui/toast";
import { courseResultStatic } from "@/shared/static/course-result";
import { AccountNavBar } from "@/features/auth";
import {
  PlaceInfo,
  PlaceInfoSheet,
  resolvePlaceCategoryTile,
  useCourseReroll,
  useCourseResult,
  useCourseSelection,
  usePlaceInfo,
} from "@/features/course-result";
import type { PlaceCandidate } from "@/features/situation";
import { RerollButton } from "./RerollButton";
import styles from "./css/CourseResultScreen.module.css";

const copy = courseResultStatic;

export interface CourseResultScreenProps {
  /** 메뉴 로그인 직전 호출(흐름 스냅샷 인계, issue #181). */
  onBeforeLogin?: () => void;
  /** 서버가 준비한 후보 목록. */
  candidates: PlaceCandidate[];
  /** 백엔드가 내려준 다른 코스 보기 잔여 횟수(표시용). */
  remainingRetries?: number;
  /** 잔여 횟수 소진 여부. true면 버튼은 눌리되 상위가 재요청 대신 안내만 한다. */
  retryExhausted?: boolean;
  toast?: ToastDisplay;
  /** CTA(선택완료) 이후 콜백. 선택 순서를 상위/다음 단계로 넘긴다. */
  onComplete?: (places: PlaceCandidate[]) => void;
  onReroll?: () => void;
  onBack?: () => void;
}

/**
 * 코스 추천 결과(장소 선택) 화면 (widgets/course-result).
 *
 * feature 훅(useCourseResult, useCourseSelection)이 준비한 후보/선택 상태를 받아
 * 결과 화면 레이아웃과 카드 목록을 조합한다.
 * 재요청 라우팅과 서버 재준비는 상위 flow/page 가 담당하고,
 * 이 위젯은 헤더/CTA/리스트/빈 상태 같은 화면 조합만 맡는다.
 *
 * 데이터는 실제 API 응답 기반이며 데모 하드코딩 장소는 쓰지 않는다.
 */
export function CourseResultScreen({
  candidates: initialCandidates,
  remainingRetries,
  retryExhausted = false,
  toast,
  onComplete,
  onReroll,
  onBack,
  onBeforeLogin,
}: CourseResultScreenProps) {
  const { selected, toggle, reset, orderOf, isValid, isFull, hint, max } =
    useCourseSelection();
  const { candidates, isEmpty } = useCourseResult({ candidates: initialCandidates });
  // 장소 정보: 휴대폰은 ⓘ → 시트, 마우스는 올려 두면 미리보기(issue #365).
  const info = usePlaceInfo({
    candidates,
    isSelected: (placeId) => orderOf(placeId) != null,
    full: isFull,
    toggle,
  });
  // 다른 코스 보기 진행/소진 정책은 feature 훅이 소유하고, 위젯은 핸들러만 바인딩한다.
  const { rerolling, handleReroll } = useCourseReroll({
    exhausted: retryExhausted,
    resetSelection: reset,
    onReroll,
  });

  /**
   * 선택 완료: 유효한 순서만 다음 단계 URL로 넘기고 라우트 전환은 상위가 맡는다.
   */
  const handleComplete = () => {
    if (!isValid) {
      return;
    }

    onComplete?.(selected);
  };

  return (
    <AppShell
      bleed
      nav={<AccountNavBar onBack={onBack} onBeforeLogin={onBeforeLogin} />}
      footer={
        <BottomActionBar>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid}
            onClick={handleComplete}
          >
            {copy.completeLabel}
          </Button>
        </BottomActionBar>
      }
      className="flex flex-col"
    >
      <Container
        className={cn("flex flex-1 flex-col pt-4 sm:pt-5", styles.screen)}
      >
        {/* 안내 문구 */}
        <p className="text-label font-semibold text-primary">
          {copy.eyebrow}
        </p>
        <h1
          className={cn(
            "text-title font-bold leading-snug text-text-strong sm:text-title-lg",
            styles.headerCopy,
          )}
        >
          {copy.title}
        </h1>
        <p
          className={cn("text-label text-text-muted sm:text-control sm:leading-5", styles.helperText)}
          aria-live="polite"
        >
          {hint}
        </p>

        {/*
          다른 코스 보기: 누를 수 있는 요소는 진보라 버튼 하나뿐이고,
          남은 횟수는 배경 없는 글자로 둬 버튼으로 오해하지 않게 한다(QA #10, issue #206).
        */}
        <div className={styles.rerollWrap}>
          <RerollButton
            variant="primary"
            label={copy.rerollLabel}
            onClick={handleReroll}
            rerolling={rerolling}
            exhausted={retryExhausted}
          />
          {remainingRetries != null && (
            <span className={styles.retryCount} aria-live="polite">
              {copy.retryCountPrefix}
              <span className={styles.retryCountNumber}>{remainingRetries}</span>
              {copy.retryCountSuffix}
            </span>
          )}
        </div>

        {isEmpty ? (
          <EmptyResult
            onRetry={handleReroll}
            rerolling={rerolling}
            exhausted={retryExhausted}
          />
        ) : (
          <>
            {/* 선택 순서 스트립 */}
            <CourseOrderStrip
              className={styles.orderStrip}
              items={selected.map((p) => ({ id: p.placeId, name: p.name }))}
              max={max}
            />

            {/* 장소 카드 목록(실제 응답 데이터). 모바일에서도 한 화면에 들어오도록 간격과 카드 높이를 압축한다. */}
            <ul className={styles.cardGrid}>
              {candidates.map((place, index) => {
                const order = orderOf(place.placeId);
                const selectedNow = order != null;
                const previewing = info.previewId === place.placeId;
                return (
                  <li
                    key={place.placeId}
                    className={styles.cardCell}
                    onMouseEnter={() => info.enterPreview(place.placeId)}
                    onMouseLeave={info.leavePreview}
                  >
                    <SelectablePlaceCard
                      name={place.name}
                      category={place.category}
                      icon={resolvePlaceCategoryTile(place.category).icon}
                      tone={resolvePlaceCategoryTile(place.category).tone}
                      region={place.district}
                      order={order}
                      rating={place.rating}
                      selected={selectedNow}
                      // 이미 선택된 카드는 최대치여도 비활성화하지 않는다(해제 가능).
                      disabled={isFull && !selectedNow}
                      onToggle={() => toggle(place)}
                      onInfo={() => info.open(place.placeId)}
                      infoLabel={copy.info.buttonLabel(place.name)}
                    />
                    {previewing ? (
                      // 같은 내용을 ⓘ 시트로도 볼 수 있어 보조 기기에는 숨긴다.
                      <div
                        aria-hidden
                        className={cn(styles.preview, index % 2 === 1 && styles.previewEnd)}
                      >
                        <p className={styles.previewTitle}>{place.name}</p>
                        <PlaceInfo place={place} compact />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Container>
      <PlaceInfoSheet
        place={info.place}
        action={info.action}
        max={max}
        onConfirm={info.confirm}
        onClose={info.close}
      />
      <ToastViewport>
        {renderToast(toast)}
      </ToastViewport>
    </AppShell>
  );
}

/** 후보가 없을 때의 안전한 빈 상태. */
function EmptyResult({
  onRetry,
  rerolling,
  exhausted,
}: {
  onRetry: () => void;
  rerolling: boolean;
  exhausted: boolean;
}) {
  return (
    <EmptyState
      illustration="place-checklist"
      title={copy.empty.title}
      description={copy.empty.description}
      className="flex-1 justify-center"
      action={
        <RerollButton
          variant="secondary"
          label={copy.empty.retryLabel}
          onClick={onRetry}
          rerolling={rerolling}
          exhausted={exhausted}
        />
      }
    />
  );
}
