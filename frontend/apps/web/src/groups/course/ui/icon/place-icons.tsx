import { IconBase, type IconProps } from "@dayro/ui";

/* 장소 카테고리 ----------------------------------------------------------- */

export function UtensilsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3" />
      <path d="M17 21V3c-2.2 1.2-3 3.7-3 6.5 0 2.3.8 3.5 3 4.5" />
    </IconBase>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8L11 3Z" />
      <path d="M19 16v4M17 18h4" />
    </IconBase>
  );
}

export function FrameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L6 21" />
    </IconBase>
  );
}

export function TreeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21v-6" />
      <path d="M12 15c-3.5 0-6-2.5-6-5.5 0-1.3.5-2.4 1.3-3.3C8 4 9.8 3 12 3s4 1 4.7 3.2c.8.9 1.3 2 1.3 3.3 0 3-2.5 5.5-6 5.5Z" />
    </IconBase>
  );
}

export function ShoppingBagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </IconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </IconBase>
  );
}
