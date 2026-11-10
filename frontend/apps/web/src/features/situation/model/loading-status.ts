import { situationStatic } from "@/shared/static/situation";

import type { SituationAnswers } from "./types";

export interface SituationLoadingCopy {
  /** 완료 표시(✅). 생성 중이면 null. */
  mark: string | null;
  title: string;
  description: string;
}

/**
 * 코스 생성 로딩 화면 상태 → 안내 문구 (QA #22, issue #203).
 * 생성 중에는 기다림 안내, 완료되면 ✅ 와 함께 다음 행동(코스 보러 가기)을 안내한다.
 * 생성 중 문구에는 고른 동네 · 목적을 넣는다. 둘 중 하나라도 없으면 기본 문구를 쓴다(issue #341).
 * @param ready 코스 생성 완료 여부.
 * @param answers 고른 조건.
 */
export function getSituationLoadingCopy(ready: boolean, answers?: SituationAnswers): SituationLoadingCopy {
  const copy = situationStatic.loading;
  if (ready) {
    return { mark: copy.ready.mark, title: copy.ready.title, description: copy.ready.description };
  }
  const place = answers?.region?.label;
  const purpose = answers?.purpose;
  const title =
    place && purpose
      ? `${place}에서 ${copy.pending.purposeNouns[purpose]} 코스를 만들고 있어요`
      : copy.pending.title;
  return { mark: null, title, description: copy.pending.description };
}
