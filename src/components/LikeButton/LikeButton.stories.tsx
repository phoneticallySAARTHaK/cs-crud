import type { Meta, StoryObj } from "@storybook/react";
import { LikeButton } from "./LikeButton";

const meta = {
  component: LikeButton,

  tags: ["autodocs"],
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
