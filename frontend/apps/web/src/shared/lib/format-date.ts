/**
 * 날짜 문자열을 화면용 `YYYY.MM.DD` 형식으로 바꾼다.
 * @param value ISO 날짜 문자열.
 * @param suffix 정상 날짜 뒤에만 붙일 문구(예: `" 저장"`).
 * @returns 무효 날짜면 접미 없이 원문.
 */
export function formatKoreanDate(value: string, suffix = ""): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatted = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\s/g, "")
    .replace(/\.$/, "");

  return formatted + suffix;
}
