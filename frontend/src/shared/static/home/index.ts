/**
 * home 도메인 정적 콘텐츠 (SSR 렌더 대상).
 * 벤토 홈의 문구 · 링크(issue #328). 일러스트 에셋은 위젯이 주입한다.
 */
const COURSE_NEW_HREF = "/course/new"; // 상황입력 플로우 진입

export const homeStatic = {
  heading: "오늘은 어떤\n데이트를 할까요?",
  cards: {
    create: {
      title: "시간 · 지역 · 목적만\n고르면 코스 완성",
      subtitle: "AI가 데이트 코스를 추천해줘요",
      cta: "코스 만들기",
      href: COURSE_NEW_HREF,
    },
    saved: {
      title: "찜한 코스",
      subtitle: "저장한 코스 다시 보기",
      href: "/saved", // 찜한 코스 목록
    },
    serviceArea: {
      title: "지금은 서울",
      subtitle: "다른 지역도 준비 중이에요",
    },
  },
  popularRegions: {
    heading: "많이 찾는 동네",
    href: COURSE_NEW_HREF,
    limit: 6,
  },
  purposes: [
    { label: "기념일", href: COURSE_NEW_HREF, purpose: "anniversary", tone: "warm" },
    { label: "소개팅", href: COURSE_NEW_HREF, purpose: "blind", tone: "cool" },
  ],
} as const;
