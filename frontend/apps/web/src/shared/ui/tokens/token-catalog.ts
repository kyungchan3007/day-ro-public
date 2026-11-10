/**
 * web 토큰 목록 (L2 앱 공통 + 라우트 묶음 · 슬라이스, issue #227 · #381).
 * 값의 원본은 `app/globals.css` · `groups/<묶음>/tokens.css` · `<slice>/css/tokens.css` 이고, 범용 토큰 목록은 `@dayro/ui/tokens` 가 따로 가진다.
 * 이 파일은 web 소유 목록(`WEB_*`)과, 스토리북 Foundations 문서가 쓰는 합친 목록(범용 + web)을 내보낸다.
 * 토큰을 추가 · 삭제하면 web 목록도 함께 고친다 — `tooling/ui-guard` 가 토큰 원본과 맞는지 검사한다.
 */
import * as base from "@dayro/ui/tokens";
import type { TokenEntry, TokenGroup } from "@dayro/ui/tokens";

export type { TokenEntry, TokenGroup };

export const WEB_COLOR_GROUPS: TokenGroup[] = [
  {
    title: "Brand",
    tokens: [
      { name: "--color-primary-gradient-end", usage: "브랜드 그라데이션 끝색" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "--color-text-subtle", usage: "시작 · 온보딩 설명" },
    ],
  },
  {
    title: "Surface & Border",
    tokens: [
      { name: "--color-surface-muted", usage: "온보딩 그림 카드 바탕" },
      { name: "--color-surface-chip", usage: "회색 보조 버튼" },
      { name: "--color-frame", usage: "앱 좌우 여백" },
      { name: "--color-border-soft", usage: "그림 카드 안 흰 카드 테두리" },
      { name: "--color-indicator-idle", usage: "진행 점(현재 아님)" },
    ],
  },
  {
    title: "Transport",
    tokens: [
      { name: "--color-transport-start", usage: "출발" },
      { name: "--color-transport-walk", usage: "도보" },
      { name: "--color-transport-subway", usage: "지하철" },
      { name: "--color-transport-subway-alt", usage: "지하철(보조)" },
      { name: "--color-transport-bus", usage: "버스" },
      { name: "--color-transport-car", usage: "자동차" },
      { name: "--color-transport-arrive", usage: "도착" },
    ],
  },
  {
    title: "Purpose",
    tokens: [
      { name: "--color-purpose-date", usage: "데이트" },
      { name: "--color-purpose-blind", usage: "소개팅" },
      { name: "--color-purpose-friends", usage: "친구" },
      { name: "--color-purpose-anniversary", usage: "기념일" },
    ],
  },
];

export const WEB_TYPE_SCALE: (TokenEntry & { utility: string })[] = [
  { name: "--text-hero", utility: "text-hero", usage: "홈 제목" },
];

export const WEB_RADIUS_SCALE: (TokenEntry & { utility: string })[] = [
  { name: "--radius-tile", utility: "rounded-tile", usage: "온보딩 장소 카드" },
];

export const WEB_SHADOW_SCALE: (TokenEntry & { utility: string })[] = [
  { name: "--shadow-card", utility: "shadow-card", usage: "장소 카드" },
  { name: "--shadow-card-active", utility: "shadow-card-active", usage: "끌어 옮기는 카드" },
  { name: "--shadow-badge", utility: "shadow-badge", usage: "번호 뱃지" },
  { name: "--shadow-marker", utility: "shadow-marker", usage: "지도 마커" },
  { name: "--shadow-brand", utility: "shadow-brand", usage: "브랜드 그라데이션 강조 칸" },
  { name: "--shadow-control", utility: "shadow-control", usage: "회색 박스 위 흰 원형 버튼 (장소 수 스테퍼)" },
];

export const WEB_MOTION_TOKENS: TokenEntry[] = [
  { name: "--duration-slide", usage: "온보딩 장 넘김" },
  { name: "--ease-slide", usage: "온보딩 장 넘김" },
  { name: "--duration-rise", usage: "시작 화면 등장" },
];

export const WEB_LAYOUT_TOKENS: (TokenEntry & { utility: string })[] = [
  { name: "--container-app", utility: "max-w-app", usage: "앱 컬럼 폭 (넓은 화면에서 멈추는 폭)" },
];

/** 같은 제목 묶음은 하나로 합친다(범용 먼저, web 뒤). */
function mergeGroups(first: TokenGroup[], second: TokenGroup[]): TokenGroup[] {
  const merged = first.map((group) => ({ title: group.title, tokens: [...group.tokens] }));
  for (const group of second) {
    const same = merged.find((item) => item.title === group.title);
    if (same) same.tokens.push(...group.tokens);
    else merged.push({ title: group.title, tokens: [...group.tokens] });
  }
  return merged;
}

/* ── 스토리북 Foundations 문서용: 범용 + web ── */
export const COLOR_GROUPS = mergeGroups(base.COLOR_GROUPS, WEB_COLOR_GROUPS);
export const PALETTE_RAMPS = base.PALETTE_RAMPS;
export const TYPE_SCALE = [...base.TYPE_SCALE, ...WEB_TYPE_SCALE];
export const RADIUS_SCALE = [...base.RADIUS_SCALE, ...WEB_RADIUS_SCALE];
export const SHADOW_SCALE = [...base.SHADOW_SCALE, ...WEB_SHADOW_SCALE];
export const MOTION_TOKENS = [...base.MOTION_TOKENS, ...WEB_MOTION_TOKENS];
export const LAYOUT_TOKENS = WEB_LAYOUT_TOKENS;
export const LAYER_TOKENS = base.LAYER_TOKENS;

/** web 이 소유한 토큰 이름(globals.css 정의분과 같아야 한다). */
export function webCatalogTokenNames(): string[] {
  return [
    ...WEB_COLOR_GROUPS.flatMap((group) => group.tokens.map((token) => token.name)),
    ...WEB_TYPE_SCALE.map((token) => token.name),
    ...WEB_RADIUS_SCALE.map((token) => token.name),
    ...WEB_SHADOW_SCALE.map((token) => token.name),
    ...WEB_MOTION_TOKENS.map((token) => token.name),
    ...WEB_LAYOUT_TOKENS.map((token) => token.name),
  ];
}
