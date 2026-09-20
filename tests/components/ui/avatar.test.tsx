import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";

describe("Avatar", () => {
  it("has no accessibility violations across sizes", async () => {
    const { container } = render(
      <>
        <Avatar size="xs" fallback="AB" />
        <Avatar size="sm" fallback="AB" />
        <Avatar size="md" fallback="AB" />
        <Avatar size="lg" fallback="AB" />
        <Avatar size="xl" fallback="AB" />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("AvatarGroup", () => {
  it("has no accessibility violations and renders an overflow badge", () => {
    const { getByText } = render(
      <AvatarGroup
        max={2}
        avatars={[{ fallback: "AA" }, { fallback: "BB" }, { fallback: "CC" }, { fallback: "DD" }]}
      />,
    );

    expect(getByText("+2")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AvatarGroup
        max={2}
        avatars={[{ fallback: "AA" }, { fallback: "BB" }, { fallback: "CC" }]}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
