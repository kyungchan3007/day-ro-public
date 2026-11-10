import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";

import { SelectablePlaceCard } from "../../ui/card/SelectablePlaceCard";

const meta = {
  component: SelectablePlaceCard,
  tags: ["ai-generated"],
  args: {
    name: "경복궁",
    category: "고궁",
    icon: "pin",
    tone: "neutral",
    region: "종로구",
    rating: 4.6,
    onToggle: fn(),
  },
  decorators: [
    // 실제 사용처(2열 그리드) 셀 폭을 흉내내 세로 카드 비율을 미리 본다.
    (Story) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          width: 344,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectablePlaceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** warm 톤(식사). */
export const Warm: Story = {
  args: { name: "을지로 골목식당", category: "식사", icon: "utensils", tone: "warm" },
};

/** cool 톤(야경/바). */
export const Cool: Story = {
  args: { name: "남산 야경 라운지", category: "야경/바", icon: "moon", tone: "cool" },
};

/** 아이콘 없이 쓰면 타일을 그리지 않는다. */
export const WithoutIcon: Story = {
  args: { icon: undefined, tone: undefined },
};

/** 정보 버튼(ⓘ)이 함께 있는 카드. */
export const WithInfo: Story = {
  args: { icon: "coffee", tone: "warm", category: "카페", onInfo: fn() },
};

export const Selected: Story = {
  args: { selected: true, order: 2 },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /경복궁/ });
    await expect(button).toHaveAttribute("aria-pressed", "true");
  },
};

/** 최대 선택 도달 시 미선택 카드의 비활성 상태. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /경복궁/ })).toBeDisabled();
  },
};

export const LongName: Story = {
  args: { name: "아주 긴 장소 이름이 들어가는 경우의 말줄임 확인용 카드", region: "종로구" },
};

/** 평점이 없는 장소(rating null)는 별점을 노출하지 않는다. */
export const NoRating: Story = {
  args: { rating: null },
};
