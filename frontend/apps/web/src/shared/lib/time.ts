/** 12시간제 시각. 상황 입력 · 코스 저장이 같은 형태로 다룬다. */
export interface ClockTime {
  meridiem: "오전" | "오후";
  hour: number;
  minute: number;
}

/** 12시간제 → 자정 기준 분(0~1439). */
export function to24Minutes(time: ClockTime): number {
  const hour = time.hour % 12; // 12 → 0
  const base = time.meridiem === "오후" ? hour + 12 : hour;
  return base * 60 + time.minute;
}

/** 12시간제 → 백엔드 요청 형식 `HH:mm:00`. */
export function formatApiTime(time: ClockTime): string {
  const totalMinutes = to24Minutes(time);
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}:00`;
}
