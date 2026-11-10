/**
 * 같은 추천 세션의 재추천 응답 순서 판단 (issue #341).
 * 대기 화면을 나간 뒤 다시 재추천하면 요청이 겹칠 수 있다. 시작 순번을 매겨, 더 늦게 시작한 요청의 응답이
 * 이미 반영됐으면 앞선 응답은 남은 횟수에 반영하지 않는다. 실패한 요청은 반영되지 않으므로 따로 처리할 것이 없다.
 */
export function createRetryOrder() {
  const started = new Map<string, number>();
  const applied = new Map<string, number>();
  return {
    /** 재추천 시작. 이 요청의 순번을 돌려준다. */
    start(requestId: string) {
      const order = (started.get(requestId) ?? 0) + 1;
      started.set(requestId, order);
      return order;
    },
    /** 응답의 남은 횟수를 반영해도 되면 true 를 돌려주고 반영한 것으로 기록한다. */
    accept(requestId: string, order: number) {
      if (order < (applied.get(requestId) ?? 0)) return false;
      applied.set(requestId, order);
      return true;
    },
  };
}
