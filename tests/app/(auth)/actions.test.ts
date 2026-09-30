import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthWeakPasswordError } from "@supabase/supabase-js";

// D-083 email + password auth: every server action, every branch.

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  resend: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  signInWithOAuth: vi.fn(),
};
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth }) }));

const cookieJar = new Map<string, string>();
const cookieStore = {
  get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
  set: vi.fn((name: string, value: string) => cookieJar.set(name, value)),
  delete: vi.fn((name: string) => cookieJar.delete(name)),
};
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

class Redirect extends Error {
  constructor(public url: string) {
    super(`REDIRECT ${url}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));

const lockout = {
  isLocked: vi.fn(),
  recordFailure: vi.fn(),
  clearFailures: vi.fn(),
  allowAuthEmail: vi.fn(),
};
vi.mock("@/lib/auth/lockout", () => lockout);

const sendLoginLockAlert = vi.fn();
vi.mock("@/lib/email/security", () => ({
  sendLoginLockAlert: (...args: unknown[]) => sendLoginLockAlert(...args),
}));

const postAuthPath = vi.fn();
vi.mock("@/lib/auth/post-auth", () => ({
  postAuthPath: (...args: unknown[]) => postAuthPath(...args),
}));

const actions = await import("@/app/(auth)/actions");
const { LOCKED, PENDING_EMAIL_COOKIE, RECOVERY_COOKIE, WRONG_CREDENTIALS } =
  await import("@/lib/auth/forms");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function redirectOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Redirect) return error.url;
    throw error;
  }
  throw new Error("expected a redirect");
}

const GOOD_PASSWORD = "Correct-Horse-9";
const authError = (code: string) => ({
  data: { user: null, session: null },
  error: { code, message: code },
});

beforeEach(() => {
  vi.clearAllMocks();
  cookieJar.clear();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://ytniches.test");
  lockout.isLocked.mockResolvedValue(false);
  lockout.recordFailure.mockResolvedValue({ locked: false, sendAlert: false });
  lockout.allowAuthEmail.mockResolvedValue(true);
  postAuthPath.mockResolvedValue("/onboarding");
});

describe("signUpWithEmail", () => {
  it("rejects a bad email and a weak password before calling Supabase", async () => {
    const state = await actions.signUpWithEmail({}, form({ email: "nope", password: "short" }));
    expect(state.fieldErrors?.email).toMatch(/valid email/);
    expect(state.fieldErrors?.password).toMatch(/12 characters/);
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("creates the unverified account with the captcha token, then goes to /check-email", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] } }, error: null });

    const url = await redirectOf(
      actions.signUpWithEmail(
        {},
        form({
          email: " New@Example.com ",
          password: GOOD_PASSWORD,
          captchaToken: "tok",
          redirect: "/niches",
        }),
      ),
    );

    expect(url).toBe("/check-email");
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: GOOD_PASSWORD,
      options: {
        emailRedirectTo: "https://ytniches.test/auth/confirm?next=%2Fniches",
        captchaToken: "tok",
      },
    });
    // The address rides in an HttpOnly cookie, never the URL.
    expect(cookieJar.get(PENDING_EMAIL_COOKIE)).toBe("new@example.com");
  });

  it("says the account exists when Supabase returns a user with no identities", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null });
    const state = await actions.signUpWithEmail(
      {},
      form({ email: "a@b.co", password: GOOD_PASSWORD }),
    );
    expect(state).toEqual({ exists: true });
  });

  it("explains a breached password, and a failed captcha", async () => {
    auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthWeakPasswordError("weak", 422, ["pwned"]),
    });
    const weak = await actions.signUpWithEmail(
      {},
      form({ email: "a@b.co", password: GOOD_PASSWORD }),
    );
    expect(weak.fieldErrors?.password).toMatch(/data breach/);

    auth.signUp.mockResolvedValueOnce(authError("captcha_failed"));
    const captcha = await actions.signUpWithEmail(
      {},
      form({ email: "a@b.co", password: GOOD_PASSWORD }),
    );
    expect(captcha.error).toMatch(/human/);
  });
});

describe("signInWithEmail", () => {
  it("checks the lock before Supabase: a locked email never reaches the password check", async () => {
    lockout.isLocked.mockResolvedValue(true);
    const state = await actions.signInWithEmail({}, form({ email: "a@b.co", password: "x" }));
    expect(state.error).toBe(LOCKED);
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("gives one generic error for wrong credentials and records the failure", async () => {
    auth.signInWithPassword.mockResolvedValue(authError("invalid_credentials"));
    const state = await actions.signInWithEmail(
      {},
      form({ email: "A@B.co", password: "wrong", captchaToken: "t" }),
    );
    expect(state).toEqual({ error: WRONG_CREDENTIALS });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.co",
      password: "wrong",
      options: { captchaToken: "t" },
    });
    expect(lockout.recordFailure).toHaveBeenCalledWith("a@b.co");
    expect(sendLoginLockAlert).not.toHaveBeenCalled();
  });

  it("locks on the failure that crosses the limit and sends the alert only when told to", async () => {
    auth.signInWithPassword.mockResolvedValue(authError("invalid_credentials"));
    lockout.recordFailure.mockResolvedValueOnce({ locked: true, sendAlert: true });
    expect(
      (await actions.signInWithEmail({}, form({ email: "a@b.co", password: "x" }))).error,
    ).toBe(LOCKED);
    expect(sendLoginLockAlert).toHaveBeenCalledTimes(1);

    lockout.recordFailure.mockResolvedValueOnce({ locked: true, sendAlert: false });
    await actions.signInWithEmail({}, form({ email: "a@b.co", password: "x" }));
    expect(sendLoginLockAlert).toHaveBeenCalledTimes(1);
  });

  it("says 'verify first' only when Supabase accepted the password, and counts no failure", async () => {
    auth.signInWithPassword.mockResolvedValue(authError("email_not_confirmed"));
    const state = await actions.signInWithEmail(
      {},
      form({ email: "a@b.co", password: GOOD_PASSWORD }),
    );
    expect(state).toEqual({ unverified: true });
    expect(lockout.recordFailure).not.toHaveBeenCalled();
    expect(cookieJar.get(PENDING_EMAIL_COOKIE)).toBe("a@b.co");
  });

  it("clears the failures and takes the same post-sign-in path as Google", async () => {
    const user = { id: "u1" };
    auth.signInWithPassword.mockResolvedValue({ data: { user }, error: null });
    const url = await redirectOf(
      actions.signInWithEmail(
        {},
        form({ email: "a@b.co", password: GOOD_PASSWORD, redirect: "/niches" }),
      ),
    );
    expect(url).toBe("/onboarding");
    expect(lockout.clearFailures).toHaveBeenCalledWith("a@b.co");
    expect(postAuthPath).toHaveBeenCalledWith(user, "/niches");
  });

  it("sends a suspended account to /suspended", async () => {
    auth.signInWithPassword.mockResolvedValue(authError("user_banned"));
    expect(
      await redirectOf(actions.signInWithEmail({}, form({ email: "a@b.co", password: "x" }))),
    ).toBe("/suspended");
  });
});

describe("requestPasswordReset", () => {
  it("answers the same whether or not the account exists", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const state = await actions.requestPasswordReset(
      {},
      form({ email: "a@b.co", captchaToken: "t" }),
    );
    expect(state).toEqual({ sent: true });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("a@b.co", {
      redirectTo: "https://ytniches.test/auth/confirm?next=%2Freset-password",
      captchaToken: "t",
    });
  });

  it("over the per-email limit: same answer, nothing sent", async () => {
    lockout.allowAuthEmail.mockResolvedValue(false);
    expect(await actions.requestPasswordReset({}, form({ email: "a@b.co" }))).toEqual({
      sent: true,
    });
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("only a failed captcha is worth saying", async () => {
    auth.resetPasswordForEmail.mockResolvedValue(authError("captcha_failed"));
    expect((await actions.requestPasswordReset({}, form({ email: "a@b.co" }))).error).toMatch(
      /human/,
    );
  });
});

describe("resendVerification", () => {
  it("resends to the address in the cookie, with the captcha token", async () => {
    cookieJar.set(PENDING_EMAIL_COOKIE, "a@b.co");
    auth.resend.mockResolvedValue({ data: {}, error: null });
    expect(await actions.resendVerification({}, form({ captchaToken: "t" }))).toEqual({
      sent: true,
    });
    expect(auth.resend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "signup",
        email: "a@b.co",
        options: expect.objectContaining({ captchaToken: "t" }),
      }),
    );
  });

  it("needs the sign-up cookie", async () => {
    expect((await actions.resendVerification({}, form({}))).error).toMatch(/expired/);
  });
});

describe("updatePassword", () => {
  it("only works from a reset link (the recovery cookie)", async () => {
    const state = await actions.updatePassword(
      {},
      form({ password: GOOD_PASSWORD, confirmPassword: GOOD_PASSWORD }),
    );
    expect(state.error).toMatch(/expired/);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("checks the rules and the confirmation", async () => {
    cookieJar.set(RECOVERY_COOKIE, "1");
    expect(
      (await actions.updatePassword({}, form({ password: "weak" }))).fieldErrors?.password,
    ).toBeDefined();
    expect(
      (
        await actions.updatePassword(
          {},
          form({ password: GOOD_PASSWORD, confirmPassword: "different" }),
        )
      ).fieldErrors?.confirmPassword,
    ).toMatch(/match/);
  });

  it("saves, signs out every other session, clears the recovery cookie, goes to the dashboard", async () => {
    cookieJar.set(RECOVERY_COOKIE, "1");
    auth.updateUser.mockResolvedValue({ data: {}, error: null });
    const url = await redirectOf(
      actions.updatePassword({}, form({ password: GOOD_PASSWORD, confirmPassword: GOOD_PASSWORD })),
    );
    expect(url).toBe("/dashboard");
    expect(auth.updateUser).toHaveBeenCalledWith({ password: GOOD_PASSWORD });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "others" });
    expect(cookieJar.has(RECOVERY_COOKIE)).toBe(false);
  });
});
