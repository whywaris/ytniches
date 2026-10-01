import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/onboarding",
}));

const updateProfileAction = vi.fn();
const updateOnboardingStepAction = vi.fn();
const skipOnboardingAction = vi.fn();
vi.mock("@/app/onboarding/actions", () => ({
  updateProfileAction: (...args: unknown[]) => updateProfileAction(...args),
  updateOnboardingStepAction: (...args: unknown[]) => updateOnboardingStepAction(...args),
  skipOnboardingAction: (...args: unknown[]) => skipOnboardingAction(...args),
  completeOnboardingAction: vi.fn(),
}));
vi.mock("@/app/(app)/niches/actions", () => ({
  searchNichesAction: vi.fn(),
  saveChannelAction: vi.fn(),
}));
vi.mock("@/app/(app)/prompts/actions", () => ({
  listTopVideosForChannelAction: vi.fn(),
  generatePromptsAction: vi.fn(),
}));

const { OnboardingClient, dbStepToUiStep } = await import("@/app/onboarding/onboarding-client");

function renderAt(initialStep: number) {
  return render(
    <ToastProvider>
      <OnboardingClient initialStep={initialStep} initialName="" initialPrimaryGoal={null} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  updateProfileAction.mockResolvedValue({ ok: true, value: undefined });
  updateOnboardingStepAction.mockResolvedValue({ ok: true, value: undefined });
  skipOnboardingAction.mockResolvedValue(undefined);
});

describe("onboarding without the Connect step (D-086)", () => {
  it.each([
    [0, 1],
    [1, 3], // parked on the removed Connect step -> search
    [2, 3],
    [3, 3],
    [4, 5],
  ] as const)("resumes stored step %i at screen %i", (step, screen) => {
    expect(dbStepToUiStep(step)).toBe(screen);
  });

  it("goes from Welcome straight to finding a niche, saving step 2, with 4 progress dots", async () => {
    const user = userEvent.setup();
    const { container } = renderAt(0);

    expect(screen.getByRole("progressbar", { name: "Onboarding progress" })).toHaveAttribute(
      "aria-valuemax",
      "4",
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.type(screen.getByLabelText("Name"), "Waris");
    await user.click(screen.getByRole("radio", { name: /exploring niches/ }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(updateProfileAction).toHaveBeenCalledWith("Waris", "explorer");
    expect(updateOnboardingStepAction).toHaveBeenCalledWith(2);
    expect(
      await screen.findByRole("heading", { name: "Let's find your first niche" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/connect/i)).not.toBeInTheDocument();
  });

  it("sends someone who stopped at the old Connect step to search", () => {
    renderAt(1);
    expect(
      screen.getByRole("heading", { name: "Let's find your first niche" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/connect your channel/i)).not.toBeInTheDocument();
  });

  it("still lets people skip onboarding, which starts the trial server-side", async () => {
    const user = userEvent.setup();
    renderAt(0);

    await user.click(screen.getByRole("button", { name: /Skip/ }));

    expect(skipOnboardingAction).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
