/**
 * 카카오 지도 리소스 주소 (features/course-map 순수 모델, issue #260).
 *
 * 로더(`lib/kakao-map-loader.ts`)와 미리 받기 힌트(`ui/KakaoMapResourceHints.tsx`)가 같은 SDK 주소를 써야
 * 브라우저가 미리 받은 스크립트를 그대로 재사용한다.
 */

/** 지도가 뜰 때 연결하는 카카오 서버 (2026-10-18 운영 찜 상세 네트워크 기록 기준). */
export const KAKAO_MAP_ORIGINS = [
  "https://example.invalid", // SDK 로더 sdk.js
  "https://example.invalid", // 지도 스크립트 kakao.js · 지도 바탕 이미지
  "https://example.invalid", // 지도 타일
] as const;

/** 카카오 지도 SDK 로더 주소. `autoload=false` 라 로드 뒤 `kakao.maps.load` 로 초기화한다. */
export function buildKakaoMapSdkSrc(appKey: string): string {
  return `https://example.invalid}&autoload=false`;
}

/** 지도에 찍을 수 있는 지점인지(위도 · 경도가 유한한 숫자). */
export function isDrawableMapPoint(point: { latitude: number; longitude: number }): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
}

/** HTML 단계에서 넣는 SDK `<script>` 의 id — 로더가 이 스크립트를 찾아 재사용한다(issue #266). */
export const KAKAO_SDK_SCRIPT_ID = "dayro-kakao-map-sdk";

/**
 * 찜 상세 HTML 에 넣는 짧은 인라인 스크립트 (issue #266).
 * 하이드레이션을 기다리지 않고 SDK 를 넣고, 로드되면 `kakao.maps.load()` 로 지도 스크립트(kakao.js)까지 미리 불러온다.
 * (`autoload=false` 라 SDK 실행만으로는 kakao.js 를 부르지 않는다. `load` 는 여러 번 불러도 안전 — 2026-10-18 운영 확인)
 * 실패하면 `data-failed` 를 남겨 로더가 새 스크립트로 다시 시도하게 한다.
 */
export function buildKakaoMapBootstrapScript(sdkSrc: string): string {
  const id = JSON.stringify(KAKAO_SDK_SCRIPT_ID);
  const src = JSON.stringify(sdkSrc).replace(/</g, "\\u003c");
  return [
    "(function(){",
    `if(document.getElementById(${id}))return;`,
    'var s=document.createElement("script");',
    `s.id=${id};s.src=${src};s.async=true;`,
    "s.onload=function(){var m=window.kakao&&window.kakao.maps;if(m)m.load(function(){});};",
    's.onerror=function(){s.setAttribute("data-failed","1");};',
    "document.head.appendChild(s);",
    "})();",
  ].join("");
}
