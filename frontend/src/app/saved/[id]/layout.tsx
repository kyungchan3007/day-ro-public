import { KakaoMapResourceHints } from "@/features/course-map/resource-hints";

/**
 * 저장 코스 상세 세그먼트 레이아웃 (issue #263).
 *
 * 지도(LCP)가 늦지 않게 카카오 서버 미리 연결 · SDK 미리 받기 힌트를 여기서 낸다.
 * 페이지 함수는 로그인 확인 · 코스 조회를 기다린 뒤 렌더돼, 그 안에서 낸 힌트는 `<head>` 가 이미 나간 뒤
 * RSC 데이터로만 붙어 효과가 없었다(#260 배포 후 확인). 레이아웃은 데이터를 기다리지 않아
 * preconnect 는 HTTP Link 헤더로, preload 는 `<head>` 로 바로 나간다.
 * 코스 데이터를 모르므로 지도 지점 유무와 관계없이 낸다(빈 코스는 드물고 비용은 sdk.js 약 2 KB).
 */
export default function SavedCourseDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KakaoMapResourceHints />
      {children}
    </>
  );
}
