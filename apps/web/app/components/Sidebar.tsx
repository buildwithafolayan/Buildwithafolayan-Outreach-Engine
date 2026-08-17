"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">O</div>
        <span className="sidebar-brand-text">Outreach Engine</span>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menu</span>
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
          <span className="sidebar-status-dot paused" />
          <span>Global sending paused</span>
        </div>
        <div className="sidebar-env">Foundation · development</div>
      </div>
    </aside>
  );
}
