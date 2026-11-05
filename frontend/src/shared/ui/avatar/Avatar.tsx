import { cn } from "../lib";

export interface AvatarProps {
  /** 동그라미 안 글자(이름 첫 글자). */
  initial: string;
  /** md 48px(계정 메뉴) · lg 64px(내 정보). */
  size?: "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  md: "size-12 text-body-lg leading-6",
  lg: "size-16 text-headline",
} as const;

/**
 * avatar : 이름 첫 글자 프로필 동그라미 (issue #309).
 * 계정 메뉴 · 내 정보 화면이 크기만 다르게 따로 그리던 것을 묶었다.
 */
export function Avatar({ initial, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-surface font-bold text-primary",
        SIZE_CLASS[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
