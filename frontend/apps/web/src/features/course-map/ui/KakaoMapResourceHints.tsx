import { preconnect, preload } from "react-dom";
import { KAKAO_MAP_ORIGINS, buildKakaoMapBootstrapScript, buildKakaoMapSdkSrc } from "../model/kakao-map-resources";

/**
 * 카카오 지도 미리 연결 · SDK 미리 받기 힌트 (issue #260).
 *
 * 지도는 하이드레이션 뒤 `useEffect` 에서야 SDK 를 요청해, 찜 상세 LCP(지도 캔버스)가 늦어졌다.
 * 서버 렌더 단계에서 `<head>` 에 힌트를 넣어 카카오 서버 연결과 SDK 다운로드를 먼저 시작한다.
 * 지도를 만드는 시점 · 방식은 그대로다.
 * - preconnect · preload: 카카오 서버 연결 · SDK 다운로드를 응답 첫 부분(Link 헤더 · `<head>`)에서 시작
 * - 인라인 스크립트(issue #266): SDK 를 바로 실행하고 `kakao.maps.load()` 로 지도 스크립트까지 하이드레이션 전에 불러옴.
 *   로더는 같은 id 의 스크립트를 찾아 재사용한다(중복 요청 없음).
 * 반드시 데이터를 기다리지 않는 layout 에서 렌더한다(페이지 함수 await 뒤에서는 `<head>` 가 이미 나가 효과 없음, #263).
 * 화면에는 아무것도 그리지 않는다.
 */
export function KakaoMapResourceHints({ appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? "" }: { appKey?: string }) {
  for (const origin of KAKAO_MAP_ORIGINS) {
    preconnect(origin);
  }
  if (!appKey) {
    return null;
  }
  const sdkSrc = buildKakaoMapSdkSrc(appKey);
  preload(sdkSrc, { as: "script" });
  return <script dangerouslySetInnerHTML={{ __html: buildKakaoMapBootstrapScript(sdkSrc) }} />;
}
