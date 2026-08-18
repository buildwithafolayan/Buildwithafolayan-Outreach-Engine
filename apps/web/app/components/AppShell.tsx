"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import FavourCopilot from "./FavourCopilot";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <FavourCopilot />
    </div>
  );
}
