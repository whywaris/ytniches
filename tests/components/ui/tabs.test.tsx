import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function renderTabs() {
  return render(
    <Tabs defaultValue="activity">
      <TabsList>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
      </TabsList>
      <TabsContent value="activity">Activity panel</TabsContent>
      <TabsContent value="videos">Videos panel</TabsContent>
    </Tabs>,
  );
}

describe("Tabs", () => {
  it("has no accessibility violations", async () => {
    const { container } = renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the default tab's panel and hides the other", () => {
    renderTabs();
    expect(screen.getByText("Activity panel")).toBeVisible();
    expect(screen.queryByText("Videos panel")).not.toBeInTheDocument();
  });

  it("switches panels on click", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: "Videos" }));

    expect(screen.getByText("Videos panel")).toBeVisible();
    expect(screen.queryByText("Activity panel")).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation between tabs", async () => {
    const user = userEvent.setup();
    renderTabs();

    screen.getByRole("tab", { name: "Activity" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Videos" })).toHaveFocus();
  });
});
