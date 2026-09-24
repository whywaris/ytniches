import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperAdmin } from "@/lib/services/admin";
import { AdminNav } from "@/components/features/admin/admin-nav";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — YTNiches",
  robots: { index: false },
};

// UI-UX-Flow.md §8.2: distinct chrome so admin can never be mistaken for
// the app -- warning-color ADMIN badge, its own nav, no app sidebar.
// Middleware already 403s non-super_admins on /admin/*; this re-check is
// defense in depth (and hides the panel's existence if middleware ever
// regresses).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireSuperAdmin();
  if (!admin.ok) notFound();

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="sticky top-0 z-30 border-b border-warning/40 bg-bg-surface-1">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-6">
          <Link href="/admin/dashboard" className="text-body font-semibold text-text-primary">
            YTNiches
          </Link>
          <span className="rounded-xs bg-warning/15 px-2 py-0.5 text-caption font-bold tracking-wider text-warning">
            ADMIN
          </span>
          <AdminNav />
          <div className="flex-1" />
          <Link
            href="/dashboard"
            className="text-body-sm text-text-secondary hover:text-text-primary"
          >
            Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-8">{children}</main>
    </div>
  );
}
