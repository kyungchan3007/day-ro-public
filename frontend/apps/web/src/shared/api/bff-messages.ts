/**
 * BFF 응답 문구 (issue #284).
 * Route Handler · 서버 계약 계층이 응답 `message`(실패 · 기본 문구, 로그아웃 완료 안내 포함)로 쓴다. 같은 문구가 여러 파일에 반복되지 않게 한곳에 둔다.
 * 백엔드가 문구를 주면 그 문구를 우선 전달하고, 여기 문구는 입력 오류 · 기본(fallback) 문구로만 쓴다.
 * 서버 로그(console) 문구는 대상이 아니다.
 */
export const BFF_MESSAGES = {
  auth: {
    loginRequired: "로그인이 필요합니다.",
    loggedOut: "로그아웃 되었습니다.",
    refreshTokenMissing: "리프레시 토큰이 없습니다.",
    invalidToken: "유효하지 않은 토큰입니다.",
    refreshFailed: "세션을 갱신하지 못했습니다. 잠시 후 다시 시도해주세요.",
    profileFailed: "회원 정보를 불러오지 못했습니다.",
    logoutFailed: "로그아웃에 실패했습니다.",
    withdrawFailed: "회원 탈퇴에 실패했습니다.",
  },
  situation: {
    invalidInput: "잘못된 상황 입력 요청입니다.",
    invalidRetry: "잘못된 추천 재요청입니다.",
    regionsFailed: "지역 목록을 불러오지 못했습니다.",
    popularKeywordsFailed: "인기 검색어를 불러오지 못했습니다.",
    generateFailed: "추천 코스를 불러오지 못했습니다.",
    retryFailed: "다른 추천 코스를 불러오지 못했습니다.",
  },
  course: {
    invalidRequest: "잘못된 코스 요청입니다.",
    invalidSave: "잘못된 코스 저장 요청입니다.",
    invalidUpdate: "잘못된 코스 수정 요청입니다.",
    saveFailed: "코스 저장에 실패했습니다.",
    listFailed: "저장한 코스를 불러오지 못했습니다.",
    detailFailed: "저장한 코스 상세를 불러오지 못했습니다.",
    updateFailed: "저장한 코스를 수정하지 못했습니다.",
    deleteFailed: "저장한 코스를 삭제하지 못했습니다.",
  },
  inquiry: {
    invalidRequest: "잘못된 문의 요청입니다.",
    sendFailed: "문의를 보내지 못했습니다.",
  },
} as const;
