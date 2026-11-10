import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { LogoutButton } from "./LogoutButton";

const meta = {
  component: LogoutButton,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof LogoutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
