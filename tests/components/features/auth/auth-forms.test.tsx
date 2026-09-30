import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthFormState } from "@/lib/auth/forms";

// D-083 auth forms. The server actions are mocked; each test sets the
// state the action returns.
const actions = {
  signInWithEmail: vi.fn<(prev: AuthFormState, data: FormData) => Promise<AuthFormState>>(),
  signUpWithEmail: vi.fn<(prev: AuthFormState, data: FormData) => Promise<AuthFormState>>(),
  requestPasswordReset: vi.fn<(prev: AuthFormState, data: FormData) => Promise<AuthFormState>>(),
  resendVerification: vi.fn<(prev: AuthFormState, data: FormData) => Promise<AuthFormState>>(),
  updatePassword: vi.fn<(prev: AuthFormState, data: FormData) => Promise<AuthFormState>>(),
};
vi.mock("@/app/(auth)/actions", () => actions);

const { LoginForm } = await import("@/components/features/auth/login-form");
const { SignupForm } = await import("@/components/features/auth/signup-form");
const { ForgotPasswordForm } = await import("@/components/features/auth/forgot-password-form");
const { Turnstile } = await import("@/components/features/auth/turnstile");
const { LOCKED, WRONG_CREDENTIALS } = await import("@/lib/auth/forms");

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("LoginForm", () => {
  it("shows the one generic error with the static Google hint", async () => {
    actions.signInWithEmail.mockResolvedValue({ error: WRONG_CREDENTIALS });
    const user = userEvent.setup();
    render(<LoginForm redirectTarget={null} />);

    await user.type(screen.getByLabelText(/^Email/, { selector: "input" }), "a@b.co");
    await user.type(screen.getByLabelText(/^Password/, { selector: "input" }), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in with email" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(WRONG_CREDENTIALS);
    expect(alert).toHaveTextContent("Signed up with Google?");
    expect(screen.getByRole("link", { name: "reset your password" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("the lock message stands alone (no Google hint needed; it names Google itself)", async () => {
    actions.signInWithEmail.mockResolvedValue({ error: LOCKED });
    const user = userEvent.setup();
    render(<LoginForm redirectTarget={null} />);
    await user.click(screen.getByRole("button", { name: "Log in with email" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/paused for 15 minutes/);
    expect(alert).not.toHaveTextContent("Signed up with Google?");
  });

  it("offers 'verify first' with a resend when the password was right", async () => {
    actions.signInWithEmail.mockResolvedValue({ unverified: true });
    actions.resendVerification.mockResolvedValue({ sent: true });
    const user = userEvent.setup();
    render(<LoginForm redirectTarget={null} />);

    await user.click(screen.getByRole("button", { name: "Log in with email" }));
    expect(await screen.findByText(/Verify your email first/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resend the link" }));
    expect(await screen.findByText(/a new link is on its way/)).toBeInTheDocument();
  });

  it("passes the redirect target through", async () => {
    actions.signInWithEmail.mockResolvedValue({});
    const user = userEvent.setup();
    render(<LoginForm redirectTarget="/niches" />);
    await user.click(screen.getByRole("button", { name: "Log in with email" }));
    const data = actions.signInWithEmail.mock.calls[0]?.[1];
    expect(data?.get("redirect")).toBe("/niches");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<LoginForm redirectTarget={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("SignupForm", () => {
  it("ticks the password rules as you type", async () => {
    const user = userEvent.setup();
    render(<SignupForm redirectTarget={null} />);
    const rules = screen.getByRole("list", { name: "Password requirements" });
    expect(rules).toHaveTextContent("At least 12 characters (not yet)");

    await user.type(screen.getByLabelText(/^Password/, { selector: "input" }), "Correct-Horse-9");
    expect(rules).not.toHaveTextContent("(not yet)");
  });

  it("says when the account already exists, pointing to Google or a reset", async () => {
    actions.signUpWithEmail.mockResolvedValue({ exists: true });
    const user = userEvent.setup();
    render(<SignupForm redirectTarget={null} />);
    await user.click(screen.getByRole("button", { name: "Sign up with email" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/already exists. Continue with Google/);
  });

  it("shows field errors from the server", async () => {
    actions.signUpWithEmail.mockResolvedValue({
      fieldErrors: { password: "This password has appeared in a data breach." },
    });
    const user = userEvent.setup();
    render(<SignupForm redirectTarget={null} />);
    await user.click(screen.getByRole("button", { name: "Sign up with email" }));
    expect(await screen.findByText(/data breach/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SignupForm redirectTarget={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ForgotPasswordForm", () => {
  it("shows the neutral 'if an account exists' message", async () => {
    actions.requestPasswordReset.mockResolvedValue({ sent: true });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/^Email/, { selector: "input" }), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      /If an account with that email exists/,
    );
  });
});

describe("Turnstile", () => {
  it("renders nothing (and asks for no script) until a site key is set", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    const { container } = render(<Turnstile action="login" onToken={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
    expect(document.querySelector('script[src*="turnstile"]')).toBeNull();
  });
});
