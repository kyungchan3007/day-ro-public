import "server-only";

import { getSituationPopularKeywords } from "@/shared/api/server-situation";
import { homeStatic } from "@/shared/static/home";

/**
 * 홈에 보여 줄 인기 동네 이름 (issue #328).
 * 못 받아도 홈은 그대로 쓸 수 있어야 하므로 실패하면 빈 목록을 돌려준다.
 */
export async function getHomePopularRegions(): Promise<string[]> {
  try {
    const { data } = await getSituationPopularKeywords();
    const names = new Set(data.map((keyword) => keyword.name));
    return [...names].slice(0, homeStatic.popularRegions.limit);
  } catch {
    return [];
  }
}
