import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@dayro/ui";
import { BottomActionBar } from "../../layout/BottomActionBar";

const meta = {
  component: BottomActionBar,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <Button variant="primary" size="lg" fullWidth>
        다음
      </Button>
    ),
  },
} satisfies Meta<typeof BottomActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 버튼 하나 (상황입력 단계 · 코스 결과 · 문의 · 탈퇴). */
export const Default: Story = {};

/** 버튼 두 개 세로 (코스 지도 · 찜 상세). */
export const TwoButtons: Story = {
  args: {
    children: (
      <>
        <Button variant="tonal" size="lg" fullWidth>
          코스 저장
        </Button>
        <Button variant="primary" size="lg" fullWidth>
          길안내 시작
        </Button>
      </>
    ),
  },
};

/** 안내 문구 + 링크 가운데 정렬 (FAQ). */
export const Centered: Story = {
  args: {
    align: "center",
    children: (
      <>
        <p className="text-label text-text-muted">원하는 답을 찾지 못했나요?</p>
        <Button variant="secondary" size="md">
          문의하기
        </Button>
      </>
    ),
  },
};
