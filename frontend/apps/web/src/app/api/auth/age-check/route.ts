import { NextRequest } from "next/server";
import {
  buildAgeCheckPassPath,
  buildAgeCheckPath,
  parseAgeCheckAnswer,
  parseAgeCheckIntent,
  parseAgeCheckNotice,
} from "@/features/auth/model/age-check";
import { sanitizeLoginNextPath } from "@/features/auth/model/oauth";
import {
  AGE_CONFIRMED_BROWSE_MAX_AGE_SECONDS,
  AGE_CONFIRMED_LOGIN_MAX_AGE_SECONDS,
} from "@/shared/api/auth-cookies";
import {
  clearAgeConfirmedCookie,
  redirectToInternalPath,
  setAgeConfirmedCookie,
} from "@/shared/api/server-auth";
import { decodeNextPathParam } from "@/shared/lib/next-path-param";

/**
 * 만 14세 확인 제출 (issue #324). JS 없이도 동작하도록 폼 POST 를 받아 이동시킨다.
 * 만 14세 미만은 쿠키를 남기지 않고, 이전 확인값도 지운다.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const intent = parseAgeCheckIntent(form?.get("intent"));
  const rawNext = form?.get("next");
  const next = sanitizeLoginNextPath(decodeNextPathParam(typeof rawNext === "string" ? rawNext : null));
  const answer = parseAgeCheckAnswer(form?.get("answer"));
  // 가입 거절로 온 경우 안내를 유지해야 남은 토큰이 있어도 폼을 건너뛰지 않는다.
  const notice = parseAgeCheckNotice(form?.get("notice"));

  if (answer === "14_or_older") {
    const response = redirectToInternalPath(buildAgeCheckPassPath(intent, next), 303);
    setAgeConfirmedCookie(
      request,
      response,
      intent === "login" ? AGE_CONFIRMED_LOGIN_MAX_AGE_SECONDS : AGE_CONFIRMED_BROWSE_MAX_AGE_SECONDS,
    );
    return response;
  }

  if (answer === "under_14") {
    const response = redirectToInternalPath(buildAgeCheckPath({ intent, next, result: "under14", notice }), 303);
    clearAgeConfirmedCookie(request, response);
    return response;
  }

  return redirectToInternalPath(buildAgeCheckPath({ intent, next, notice }), 303);
}
