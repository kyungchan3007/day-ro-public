import { cn, LogoutIcon } from "@dayro/ui";

export interface LogoutButtonProps {
  /** 실제 로그아웃 동작은 상위에서 주입한다. */
  onClick?: () => void;
  className?: string;
}

/**
 * 계정 메뉴의 로그아웃 버튼.
 *
 * 아이콘·라벨을 내장해 props 없이 그대로 쓴다. 동작만 onClick 으로 주입한다.
 */
export function LogoutButton({ onClick, className }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-1 py-3.5 text-left text-body font-semibold text-text-strong active:opacity-60",
        className,
      )}
    >
      <LogoutIcon size={18} className="text-text-muted" />
      로그아웃
    </button>
  );
}
