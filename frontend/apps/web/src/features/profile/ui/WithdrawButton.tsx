import Link from "next/link";
import { cn } from "@dayro/ui";

export interface WithdrawButtonProps {
  label: string;
  /** 있으면 Link 로 렌더(탈퇴 흐름 진입). 없으면 button. */
  href?: string;
  /** 실제 탈퇴 동작은 상위에서 주입한다. */
  onClick?: () => void;
  className?: string;
}

/**
 * 내 정보 화면의 회원탈퇴 버튼.
 *
 * 작고 옅은 밑줄 텍스트 스타일만 제공하는 프레젠테이션 컴포넌트다.
 * 동작은 상위에서 href(진입) 또는 onClick 으로 주입한다.
 */
export function WithdrawButton({
  label,
  href,
  onClick,
  className,
}: WithdrawButtonProps) {
  const cls = cn(
    "mx-auto p-1 text-meta leading-4 text-text-disabled underline transition-colors hover:text-text-muted",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  );
}
