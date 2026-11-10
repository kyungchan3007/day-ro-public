import Link from "next/link";

import { AgeCheckForm } from "@/features/auth";
import {
  buildAgeCheckPath,
  buildAlreadyMemberPath,
  type AgeCheckIntent,
} from "@/features/auth/model/age-check";
import { authStatic } from "@/shared/static/auth";
import { buttonClassName, LogoHorizontal } from "@dayro/ui";
import { AppShell } from "@/shared/ui/layout";

import styles from "./css/LoginScreen.module.css";

export interface AgeCheckScreenProps {
  intent: AgeCheckIntent;
  /** 확인 후 돌아갈 내부 경로(서버 page 가 검증한 값). */
  next?: string;
  isUnder14: boolean;
  /** 신규 회원이 확인값 없이 카카오를 거쳐 돌아온 경우. */
  confirmRequired: boolean;
}

const quietLinkClass =
  "flex min-h-11 items-center justify-center text-control text-text-muted underline focus-ring";

/**
 * 만 14세 확인 화면 (widgets/auth, issue #324). 로그인 화면과 같은 골격을 쓴다.
 * 판단 · 이동은 app 과 Route Handler 가 맡고, 이 화면은 조각만 배치한다.
 */
export function AgeCheckScreen({ intent, next, isUnder14, confirmRequired }: AgeCheckScreenProps) {
  const copy = authStatic.ageCheck;
  const { service, privacy } = authStatic.login.terms;
  const notice = confirmRequired ? "confirm_required" : undefined;

  return (
    <AppShell className={styles.shell}>
      <div className={styles.logoWrap}>
        <LogoHorizontal priority />
      </div>
      {isUnder14 ? (
        <section
          aria-labelledby="age-check-title"
          className={`${styles.card} rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8`}
        >
          <div className={styles.copyBlock}>
            <h1 id="age-check-title" className="text-title-lg font-extrabold leading-snug text-text-strong">
              {copy.under14.title}
            </h1>
            <p className="mt-3 whitespace-pre-line text-control leading-relaxed text-text-muted">
              {copy.under14.body}
            </p>
          </div>
          <Link href="/" className={`mt-6 ${buttonClassName({ size: "lg", fullWidth: true })}`}>
            {copy.under14.homeLabel}
          </Link>
          <Link href={buildAgeCheckPath({ intent, next, notice })} className={`mt-2 ${quietLinkClass}`}>
            {copy.under14.retryLabel}
          </Link>
          <div className="mt-2 flex justify-center gap-4">
            <Link href={service.href} className={quietLinkClass}>
              {service.label}
            </Link>
            <Link href={privacy.href} className={quietLinkClass}>
              {privacy.label}
            </Link>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="age-check-title"
          className={`${styles.card} rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8`}
        >
          <div className={styles.copyBlock}>
            <h1 id="age-check-title" className="text-title-lg font-extrabold leading-snug text-text-strong">
              {copy.title}
            </h1>
            <p className="mt-3 text-control leading-relaxed text-text-muted">{copy.subtitle}</p>
          </div>
          {confirmRequired ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-control leading-5 text-danger-strong"
            >
              {copy.confirmRequiredNotice}
            </p>
          ) : null}
          <AgeCheckForm intent={intent} next={next} notice={notice} className="mt-6" />
          {intent === "login" && !confirmRequired ? (
            // Route Handler → 카카오로 나가는 전체 이동이라 next/link 를 쓰지 않는다.
            <a href={buildAlreadyMemberPath(next)} className={`mt-2 ${quietLinkClass}`}>
              {copy.alreadyMemberLabel}
            </a>
          ) : null}
        </section>
      )}
    </AppShell>
  );
}
