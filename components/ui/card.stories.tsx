import { Button } from "@/components/ui/button";
import { Card, CardActions, CardFooter, CardHeader } from "@/components/ui/card";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Card> = {
  title: "ui/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card variant="base" className="w-64">
        Base
      </Card>
      <Card variant="interactive" className="w-64">
        Interactive (hover me)
      </Card>
      <Card variant="selected" className="w-64">
        Selected
      </Card>
    </div>
  ),
};

// Padding options double as the density scale Table (Batch C) will reuse
// (Design-System.md §1.1 principle 6, §5.4 density toggle).
export const Padding: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card padding="sm" className="w-64">
        Small padding (12px)
      </Card>
      <Card padding="md" className="w-64">
        Medium padding (16px)
      </Card>
      <Card padding="lg" className="w-64">
        Large padding (24px)
      </Card>
    </div>
  ),
};

export const WithSlots: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <span className="font-semibold">Niche Finder</span>
      </CardHeader>
      Save this channel to start tracking it.
      <CardFooter>
        <CardActions>
          <Button variant="ghost" size="sm">
            Dismiss
          </Button>
          <Button size="sm">Save</Button>
        </CardActions>
      </CardFooter>
    </Card>
  ),
};
