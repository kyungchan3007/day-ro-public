import type { IconProps } from "@dayro/ui";
import { CoffeeIcon, PinIcon } from "@dayro/ui";
import { FrameIcon, MoonIcon, ShoppingBagIcon, SparklesIcon, TreeIcon, UtensilsIcon } from "./place-icons";

const ICONS = {
  utensils: UtensilsIcon,
  coffee: CoffeeIcon,
  sparkles: SparklesIcon,
  frame: FrameIcon,
  tree: TreeIcon,
  bag: ShoppingBagIcon,
  moon: MoonIcon,
  pin: PinIcon,
} as const;

/** 이름(키)으로 고르는 아이콘 키. 도메인을 모르는 UI 가 표현만 받을 때 쓴다. */
export type IconName = keyof typeof ICONS;

export function NamedIcon({ name, ...props }: IconProps & { name: IconName }) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
