"use client";

import * as React from "react";

// D-083: Cloudflare Turnstile for the password flows; Supabase Auth checks
// the token server-side (its built-in CAPTCHA). No npm package: Cloudflare's
// script, loaded once, explicit render. Tokens are single-use, so the
// widget resets whenever `resetKey` changes (after each submission).
// Without NEXT_PUBLIC_TURNSTILE_SITE_KEY it renders nothing and the token
// stays empty -- fine until CAPTCHA is switched on in Supabase.

interface TurnstileApi {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error("no turnstile"));
    script.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileProps {
  /** Receives the token, or "" when it expires or fails. */
  onToken: (token: string) => void;
  /** Changes after each submission to get a fresh token. */
  resetKey?: unknown;
  /** Shown in Turnstile analytics: "signup", "login", "reset". */
  action: string;
}

function Turnstile({ onToken, resetKey, action }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | undefined>(undefined);
  const onTokenRef = React.useRef(onToken);
  React.useEffect(() => {
    onTokenRef.current = onToken;
  });

  React.useEffect(() => {
    if (!siteKey || !container.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: siteKey,
          action,
          theme: "dark",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => onTokenRef.current(""));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey, action]);

  React.useEffect(() => {
    if (resetKey === undefined || !widgetId.current) return;
    onTokenRef.current("");
    window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  if (!siteKey) return null;
  return <div ref={container} className="flex min-h-[65px] justify-center" />;
}

export { Turnstile };
