import type { Meta, StoryObj } from "@storybook/react";
import { OrderCard } from "./OrderCard";

const meta = {
  component: OrderCard,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof OrderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    data: {
      customer_email: "",
      customer_name: "",
      id: "",
      product: "",
      quantity: 0,
    },
  },
};
