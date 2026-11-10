import type { DashboardRange } from "@/features/analytics";

import { DashboardShell } from "./DashboardShell";

type NoticeKind = "forbidden" | "not_configured" | "upstream_error";

const COPY: Record<NoticeKind, { title: string; body: string }> = {
  forbidden: {
    title: "접근 권한이 없어요",
    body: "팀 계정으로 Cloudflare Access 로그인을 거쳐 들어와 주세요.",
  },
  not_configured: {
    title: "GA4 연결 설정이 비어 있어요",
    body: "Worker 시크릿 GA4_PROPERTY_ID · GA4_SERVICE_ACCOUNT_JSON 을 등록하면 숫자가 보여요.",
  },
  upstream_error: {
    title: "GA4 데이터를 불러오지 못했어요",
    body: "잠시 뒤 새로고침해 주세요. 계속되면 서비스 계정의 GA4 속성 권한을 확인해 주세요.",
  },
};

interface DashboardNoticeProps {
  kind: NoticeKind;
  range?: DashboardRange;
}

export function DashboardNotice({ kind, range }: DashboardNoticeProps) {
  const copy = COPY[kind];
  const isError = kind === "upstream_error";

  return (
    // 권한이 없으면 기간 전환도 숨긴다.
    <DashboardShell range={kind === "forbidden" ? undefined : range}>
      <div
        role={isError ? "alert" : "status"}
        className={`flex flex-col gap-1 rounded-card border p-5 ${
          isError ? "border-danger-border bg-danger-surface text-danger-strong" : "border-border bg-surface"
        }`}
      >
        <h2 className={`text-body-lg leading-6 font-semibold ${isError ? "" : "text-text-strong"}`}>{copy.title}</h2>
        <p className={`text-control leading-5 ${isError ? "" : "text-text-secondary"}`}>{copy.body}</p>
      </div>
    </DashboardShell>
  );
}
