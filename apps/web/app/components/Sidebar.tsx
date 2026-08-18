"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: "⊞",
    color: "linear-gradient(135deg, #007aff, #0056b3)",
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: "◉",
    color: "linear-gradient(135deg, #00c7be, #009688)",
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    icon: "◈",
    color: "linear-gradient(135deg, #af52de, #7928ca)",
  },
  {
    href: "/activity",
    label: "Activity",
    icon: "◷",
    color: "linear-gradient(135deg, #ff9500, #e65100)",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "◩",
    color: "linear-gradient(135deg, #ff2d55, #c2185b)",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙",
    color: "linear-gradient(135deg, #64748b, #334155)",
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
      {/* Apple Brand Identity */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          B
        </div>
        <div>
          <span className="sidebar-brand-text">BuildWithAfolayan</span>
          <span
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
            }}
          >
            Private Outreach
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>
        {navItems.map(({ href, label, icon, color }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${isActive(href) ? " active" : ""}`}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <div
              className="sidebar-link-icon-wrap"
              style={{
                background: color,
                color: "#ffffff",
                boxShadow: isActive(href)
                  ? "0 4px 10px rgba(0, 0, 0, 0.3)"
                  : "0 2px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              {icon}
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Dynamic Island Status Widget */}
      <div className="sidebar-footer">
        <div className="sidebar-island-pill">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: globalSending ? "var(--success)" : "var(--warning)",
                  boxShadow: `0 0 10px ${globalSending ? "var(--success)" : "var(--warning)"}`,
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 650, color: "var(--text-primary)" }}>
                {globalSending ? "Sending Active" : "Sending Paused"}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: "100px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--text-secondary)",
              }}
            >
              Live
            </span>
          </div>

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
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "140px",
              }}
              title={gmailEmail || "No Gmail mailbox connected"}
            >
              {gmailEmail ? `✉ ${gmailEmail}` : "No Gmail linked"}
            </span>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
              title="Lock private session and logout"
            >
              {isLoggingOut ? "Locking..." : "🔒 Lock"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
