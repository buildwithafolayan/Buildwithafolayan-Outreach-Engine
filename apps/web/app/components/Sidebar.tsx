"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/contacts", label: "Contacts", icon: "◉" },
  { href: "/campaigns", label: "Campaigns", icon: "◈" },
  { href: "/activity", label: "Activity", icon: "◷" },
  { href: "/analytics", label: "Analytics", icon: "◩" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [globalSending, setGlobalSending] = useState(false);
  const [hasGmail, setHasGmail] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()).catch(() => ({})),
      fetch("/api/gmail/account").then((r) => r.json()).catch(() => ({})),
    ]).then(([setData, accData]) => {
      if (setData?.settings) {
        setGlobalSending(setData.settings.globalSendingEnabled);
      }
      if (accData?.account) {
        setHasGmail(true);
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">F</div>
        <span className="sidebar-brand-text">Favour Outreach OS</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${isActive(href) ? " active" : ""}`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <span className="sidebar-link-icon" aria-hidden="true">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span
            className={`sidebar-status-dot${
              globalSending ? " active" : " paused"
            }`}
            style={{
              background: globalSending ? "var(--success)" : "var(--warning)",
            }}
          />
          <span>
            {globalSending
              ? "Global sending active"
              : hasGmail
              ? "Gmail ready (paused)"
              : "Global sending paused"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div className="sidebar-env" style={{ fontSize: "11px" }}>
            Private Instance
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-ghost"
            style={{
              fontSize: "11px",
              padding: "2px 6px",
              color: "var(--text-tertiary)",
            }}
            title="Lock session and log out"
          >
            {isLoggingOut ? "Locking..." : "🔒 Lock"}
          </button>
        </div>
      </div>
    </aside>
  );
}
