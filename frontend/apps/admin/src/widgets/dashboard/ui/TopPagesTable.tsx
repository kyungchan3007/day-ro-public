import type { TopPage } from "@/features/analytics";

import { formatCount } from "./format";

export function TopPagesTable({ pages }: { pages: TopPage[] }) {
  if (pages.length === 0) {
    return <p className="py-6 text-center text-control leading-5 text-text-muted">이 기간에 조회 기록이 없어요.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-control leading-5">
        <thead>
          <tr className="border-b border-border text-left text-meta leading-4 text-text-muted">
            <th scope="col" className="py-2 pr-3 font-medium">경로</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">페이지뷰</th>
            <th scope="col" className="py-2 text-right font-medium">활성 사용자</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.path} className="border-b border-border last:border-0">
              <td className="max-w-0 truncate py-2 pr-3 font-mono text-meta leading-4 text-text" title={page.path}>
                {page.path}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-text-strong">{formatCount(page.views)}</td>
              <td className="py-2 text-right tabular-nums text-text-secondary">{formatCount(page.activeUsers)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
