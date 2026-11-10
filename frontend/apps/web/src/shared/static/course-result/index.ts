/**
 * course-result(코스 추천 결과 · 장소 선택) 도메인 정적 문구 (issue #229).
 */
export const courseResultStatic = {
  eyebrow: "AI가 추천한 장소예요",
  title: "탭해서 방문 순서를 정해보세요",
  completeLabel: "선택완료",
  /** 다른 코스 보기 · 다시 추천받기 버튼 진행 중 문구. */
  rerollingLabel: "다시 받는 중…",
  rerollLabel: "다른 코스 보기",
  /** 남은 횟수: `남은 {n}회` — 숫자만 강조 span 으로 감싼다. */
  retryCountPrefix: "남은 ",
  retryCountSuffix: "회",
  /** 장소 정보 보기 — ⓘ 버튼 · 정보 시트 · 마우스 미리보기 (issue #365). */
  info: {
    buttonLabel: (name: string) => `${name} 정보 보기`,
    selectLabel: "이 장소 선택하기",
    deselectLabel: "선택 해제",
    closeLabel: "닫기",
    fullLabel: (max: number) => `최대 ${max}곳까지 고를 수 있어요`,
    reviews: (count: number) => `리뷰 ${count.toLocaleString("ko-KR")}개`,
  },
  /** 추천 결과 빈 화면 — 공용 EmptyState (issue #309). */
  empty: {
    title: "추천된 장소가 없어요",
    description: "다시 추천을 받아볼까요?",
    retryLabel: "다시 추천받기",
  },
} as const;
