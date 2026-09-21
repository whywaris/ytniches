import { Inter, JetBrains_Mono } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast-provider";

import type { Metadata } from "next";
import "./globals.css";

// Design-System.md §3.1. Instrument Serif (marketing-only display font)
// is deferred to the Landing-Page-Spec work — not needed for
// components/ui/.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YTNiches",
  description: "Research + execution loop for YouTube creators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
