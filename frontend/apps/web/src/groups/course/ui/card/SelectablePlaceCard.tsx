"use client";

import { cn, InfoIcon, StarIcon } from "@dayro/ui";
import { PlaceNumberBadge } from "../badge";
import { NamedIcon, type IconName } from "../icon";

/** 아이콘 타일 색 톤. warm=orange, cool=teal (홈 목적 카드와 같은 토큰), neutral=gray. */
export type PlaceCardTone = "warm" | "cool" | "neutral";

const TONE_CLASS: Record<PlaceCardTone, string> = {
  warm: "bg-orange-100 text-orange-600",
  cool: "bg-teal-100 text-teal-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

export interface SelectablePlaceCardProps {
  /** 장소명(카드 제목). */
  name: string;
  /** 카테고리(예: 고궁, 시장). */
  category?: string;
  /** 지역(district, 예: 종로구). */
  region?: string;
  /** 이름 왼쪽 아이콘 타일의 아이콘. 없으면 타일을 그리지 않는다(장식, 스크린리더에는 숨김). */
  icon?: IconName;
  /** 아이콘 타일 색 톤. 기본 neutral. */
  tone?: PlaceCardTone;
  /** 선택 순번(1-based). 선택된 경우에만 뱃지로 노출한다. */
  order?: number;
  /** 평점(0~5). null/undefined 면(평점 없는 장소) 표시하지 않는다. */
  rating?: number | null;
  /** 선택 여부. primary 스타일 + aria-pressed 로 전달. */
  selected?: boolean;
  /** 비활성(최대 선택 도달 시 미선택 카드). 선택된 카드는 비활성화하지 않는다. */
  disabled?: boolean;
  /** 카드 탭 콜백(선택/해제 토글은 상위에서 결정). */
  onToggle?: () => void;
  /** 있으면 오른쪽 아래에 정보 버튼(ⓘ)을 둔다. 카드 선택과 따로 동작한다(issue #365). */
  onInfo?: () => void;
  /** 정보 버튼 이름(스크린리더). */
  infoLabel?: string;
  className?: string;
}

/**
 * card-place-selectable : 순서 선택형 장소 카드 (도메인 없는 공용 프레젠테이션 UI).
 *
 * 시안(HTML) 기준의 세로 카드(2열 그리드 셀)다. 순번 뱃지는 우측 상단에 겹쳐 놓고,
 * 이름·메타·평점을 세로로 쌓는다. 탭하면 순서를 매기는 토글 버튼이며 선택/순서 규칙은
 * 담지 않고 `selected`/`order`/`disabled`/`onToggle` 로 상위(도메인 훅)가 주입한다.
 *   - selected 상태는 `aria-pressed` 로, 순번은 뱃지 + sr-only 텍스트로 함께 전달한다(색상 의존 금지).
 */
export function SelectablePlaceCard({
  name,
  category,
  region,
  icon,
  tone = "neutral",
  order,
  rating,
  selected = false,
  disabled = false,
  onToggle,
  onInfo,
  infoLabel,
  className,
}: SelectablePlaceCardProps) {
  const meta = [category, region].filter(Boolean).join(" · ");
  // 스크린리더에 선택 상태/순번을 텍스트로도 전달한다.
  const statusText = selected
    ? `선택됨, ${order}번째 방문`
    : disabled
      ? "선택할 수 없음"
      : "선택 안 됨";

  const card = (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "relative flex h-full w-full flex-col rounded-lg border-2 px-2.5 py-2.5 text-left transition-colors sm:px-3 sm:py-3.5",
        "focus-ring",
        selected
          ? "border-primary bg-primary-surface"
          : "border-border bg-surface hover:border-border-strong",
        disabled && "opacity-40",
        // 정보 버튼과 겹치지 않게 오른쪽 아래 자리를 비운다.
        onInfo && "pb-9 sm:pb-10",
        !onInfo && className,
      )}
    >
      {/* 순번 뱃지: 우측 상단 겹침. 선택 시에만 숫자 표시. */}
      {selected && order != null ? (
        <PlaceNumberBadge
          value={order}
          size="md"
          className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5"
        />
      ) : (
        <span
          aria-hidden
          className="absolute right-2 top-2 size-5 rounded-full border-[1.5px] border-border-strong bg-surface sm:right-2.5 sm:top-2.5 sm:size-6"
        />
      )}

      {/* 아이콘 타일 + 이름 · 메타 (우측 뱃지와 겹치지 않게 pr 확보). 좁은 2열(375px)은 32px 타일. */}
      <span className="flex min-w-0 items-start gap-2 pr-5 sm:gap-2.5 sm:pr-7">
        {icon && (
          <span
            aria-hidden
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md sm:size-10 sm:rounded-lg",
              TONE_CLASS[tone],
            )}
          >
            <NamedIcon name={icon} size={18} className="sm:size-5" />
          </span>
        )}
        <span className="block min-w-0 flex-1">
          {/* 말줄임 대신 두 줄까지 보여 줘 좁은 폭 · 글자 확대에서도 이름이 덜 잘린다. */}
          <span
            className={cn(
              "line-clamp-2 break-words text-control font-bold sm:text-body",
              selected ? "text-primary" : "text-text-strong",
            )}
          >
            {name}
          </span>
          {meta && (
            <span className="mt-0.5 line-clamp-2 break-words text-caption text-text-muted sm:text-meta sm:leading-4">
              {meta}
            </span>
          )}
        </span>
      </span>

      {/* 평점(있을 때만). 세로 카드라 이름/메타 아래에 배치. */}
      {rating != null && (
        <span className="mt-1.5 flex items-center gap-0.5 text-meta font-semibold text-text-secondary sm:mt-2 sm:text-label">
          <span aria-hidden style={{ color: "var(--color-orange-400)" }}>
            <StarIcon size={12} />
          </span>
          <span className="sr-only">평점 </span>
          {rating.toFixed(1)}
          <span className="sr-only">점</span>
        </span>
      )}

      <span className="sr-only">{statusText}</span>
    </button>
  );

  if (!onInfo) {
    return card;
  }

  // button 안에 button 을 둘 수 없어, 정보 버튼은 카드의 형제로 겹쳐 놓는다.
  // 그림은 작게, 누르는 영역은 44px 로 잡는다. 최대 선택으로 카드가 비활성이어도 정보는 볼 수 있다.
  return (
    <div className={cn("relative h-full", className)}>
      {card}
      <button
        type="button"
        onClick={onInfo}
        aria-label={infoLabel ?? `${name} 정보 보기`}
        aria-haspopup="dialog"
        className="focus-ring absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-primary"
      >
        <InfoIcon size={18} />
      </button>
    </div>
  );
}
