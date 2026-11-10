import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildAgeCheckPassPath,
  needsAgeCheck,
  parseAgeCheckIntent,
  readAgeCheckSignals,
} from "@/features/auth/model/age-check";
import { sanitizeLoginNextPath } from "@/features/auth/model/oauth";
import { authStatic } from "@/shared/static/auth";
import { AgeCheckScreen } from "@/widgets/auth";

export const metadata: Metadata = {
  title: authStatic.ageCheck.metaTitle,
  robots: { index: false },
};

interface AgeCheckPageProps {
  searchParams?: Promise<{ intent?: string; next?: string; result?: string; notice?: string }>;
}

/**
 * 만 14세 확인 (issue #324). 둘러보기 · 카카오 로그인 · `/course/new` 직접 진입이 공통으로 쓴다.
 * 이미 확인했으면 바로 넘기되, 안내 상태는 자동 이동보다 우선한다(거절 반복 · 안내 유실 방지).
 */
export default async function AgeCheckPage({ searchParams }: AgeCheckPageProps) {
  const params = await searchParams;
  const intent = parseAgeCheckIntent(params?.intent);
  const next = sanitizeLoginNextPath(params?.next);
  const isUnder14 = params?.result === "under14";
  const confirmRequired = params?.notice === "confirm_required";

  if (!isUnder14 && !confirmRequired && !needsAgeCheck(readAgeCheckSignals(await cookies()))) {
    redirect(buildAgeCheckPassPath(intent, next));
  }

  return (
    <AgeCheckScreen
      intent={intent}
      next={next ?? undefined}
      isUnder14={isUnder14}
      confirmRequired={confirmRequired}
    />
  );
}
