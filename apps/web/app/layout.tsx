import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import "./globals.css";
import AppShell from "./components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Favour Outreach OS",
    template: "%s | Favour Outreach OS",
  },
  description: "Private, single-operator AI outbound sales operations command center.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
