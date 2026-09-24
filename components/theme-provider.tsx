"use client";

import * as React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";

// D-008/app/globals.css already implements the CSS side (:root[data-theme="light"]
// override, dark by default) -- this is just the JS bridge: read the stored
// preference on mount, apply it, and expose a toggle for the command
// palette's "Toggle theme" action.
const STORAGE_KEY = "ytniches:theme";
type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const stored = readLocalStorage<Theme | null>(STORAGE_KEY, null, (raw) =>
      raw === "light" || raw === "dark" ? raw : null,
    );
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, same pattern as components/ui/sidebar.tsx
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((previous) => {
      const next = previous === "dark" ? "light" : "dark";
      applyTheme(next);
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  return React.useContext(ThemeContext);
}

export { ThemeProvider, useTheme };
