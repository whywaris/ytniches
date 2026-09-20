"use client";

import * as React from "react";

import { Toast as RadixToast } from "radix-ui";

import { Toast, type ToastVariant } from "@/components/ui/toast";

// Design-System.md §5.9: max 3 visible, auto-dismiss 5s default / 8s
// warning / sticky error.
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;
const DURATIONS: Record<ToastVariant, number> = {
  info: 5000,
  success: 5000,
  warning: 8000,
  error: Infinity,
};

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }].slice(-MAX_VISIBLE));
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((item) => (
          <Toast
            key={item.id}
            variant={item.variant}
            title={item.title}
            description={item.description}
            duration={DURATIONS[item.variant]}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
          />
        ))}
        <RadixToast.Viewport className="fixed right-4 bottom-4 z-50 flex w-96 max-w-full flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { ToastProvider, useToast };
