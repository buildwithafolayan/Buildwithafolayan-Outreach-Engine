"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Send,
  Clock,
  BarChart3,
  Settings,
  Lock,
  Mail,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: Users,
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: Send,
  },
  {
    href: "/activity",
    label: "Activity",
    icon: Clock,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [globalSending, setGlobalSending] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
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
        setGmailEmail(accData.account.email);
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
      {/* Brand Identity */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          B
        </div>
        <div>
          <span className="sidebar-brand-text">BuildWithAfolayan</span>
          <span className="sidebar-brand-sub">Outreach Engine</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2 : 1.75}
                className="sidebar-link-icon"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Status & Session Footer */}
      <div className="sidebar-footer">
        <div
          style={{
            backgroundColor: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Engine Status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: globalSending ? "var(--success)" : "var(--warning)",
                }}
              />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                {globalSending ? "Dispatch Active" : "Dispatch Paused"}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              OS v2.1
            </span>
          </div>

          {/* Mailbox & Session Lock */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "var(--text-tertiary)",
              paddingTop: "6px",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "130px",
              }}
              title={gmailEmail || "No Gmail mailbox linked"}
            >
              <Mail size={12} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {gmailEmail ? gmailEmail.split("@")[0] : "Offline"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 500,
                transition: "color 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
              title="Lock private session and logout"
            >
              <Lock size={12} strokeWidth={1.75} />
              <span>{isLoggingOut ? "Locking..." : "Lock"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
