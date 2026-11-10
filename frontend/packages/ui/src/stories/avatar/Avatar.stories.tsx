import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar } from "../../avatar/Avatar";

const meta = {
  component: Avatar,
  tags: ["ai-generated"],
  args: { initial: "데" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 48px — 계정 메뉴. */
export const Medium: Story = { args: { size: "md" } };

/** 64px — 내 정보 화면. */
export const Large: Story = { args: { size: "lg" } };
