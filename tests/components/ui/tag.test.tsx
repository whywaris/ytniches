import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Tag } from "@/components/ui/tag";

describe("Tag", () => {
  it("has no accessibility violations across tones", async () => {
    const { container } = render(
      <>
        <Tag tone="neutral">Draft</Tag>
        <Tag tone="success">Active</Tag>
        <Tag tone="warning">Pending</Tag>
        <Tag tone="error">Failed</Tag>
        <Tag tone="info">New</Tag>
        <Tag tone="niches">Niche</Tag>
        <Tag tone="channels">Channel</Tag>
        <Tag tone="videos">Video</Tag>
        <Tag tone="prompts">Prompt</Tag>
        <Tag tone="calendar">Calendar</Tag>
        <Tag tone="tasks">Task</Tag>
        <Tag tone="outliers">Outlier</Tag>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
