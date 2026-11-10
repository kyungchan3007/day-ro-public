const numberFormat = new Intl.NumberFormat("ko-KR");

export function formatCount(value: number): string {
  return numberFormat.format(value);
}

const timeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** 조회 시각은 팀 기준(서울)으로 표시한다. GA4 집계 기준 시간대와는 별개다. */
export function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "-" : `${timeFormat.format(date)} 조회`;
}
