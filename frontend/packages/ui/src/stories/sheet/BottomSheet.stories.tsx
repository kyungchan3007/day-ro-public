import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { BottomSheet } from "../../sheet/BottomSheet";

/** 범용 시트 껍데기. 앱 폭은 `panelClassName` 으로 앱이 정한다(기본은 전체 폭). */
const meta = {
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    onClose: fn(),
    title: "시트 제목",
    children: <p>시트 내용</p>,
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
