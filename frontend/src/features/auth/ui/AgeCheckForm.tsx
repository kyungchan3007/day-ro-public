import { BFF_ENDPOINTS } from "@/shared/api/endpoints";
import { encodeNextPathParam } from "@/shared/lib/next-path-param";
import { authStatic } from "@/shared/static/auth";
import { Button } from "@/shared/ui/button";

import type { AgeCheckIntent, AgeCheckNotice } from "../model/age-check";

export interface AgeCheckFormProps {
  intent: AgeCheckIntent;
  /** 확인 후 돌아갈 내부 경로(서버 page 가 검증한 값). */
  next?: string;
  /** 가입 거절로 돌아온 상태. 다시 선택할 때까지 유지한다. */
  notice?: AgeCheckNotice;
  /** form 요소 className(배치는 화면 조합 쪽에서 준다). */
  className?: string;
}

/**
 * 만 14세 확인 폼 (features/auth 조각, issue #324).
 * 버튼 한 번으로 제출하고, 판단과 이동은 Route Handler 가 맡는다.
 */
export function AgeCheckForm({ intent, next, notice, className }: AgeCheckFormProps) {
  const { confirmLabel, underLabel } = authStatic.ageCheck;
  return (
    <form action={`${BFF_ENDPOINTS.authAgeCheck}/`} method="post" className={className}>
      <input type="hidden" name="intent" value={intent} />
      {next ? <input type="hidden" name="next" value={encodeNextPathParam(next)} /> : null}
      {notice ? <input type="hidden" name="notice" value={notice} /> : null}
      <div className="flex flex-col gap-3">
        <Button type="submit" name="answer" value="14_or_older" size="lg" fullWidth>
          {confirmLabel}
        </Button>
        <Button type="submit" name="answer" value="under_14" variant="secondary" size="lg" fullWidth>
          {underLabel}
        </Button>
      </div>
    </form>
  );
}
