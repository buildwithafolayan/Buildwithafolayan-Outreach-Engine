import type { ReactNode } from "react";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function Header({ eyebrow, title, description, actions }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: "260px" }}>
        {eyebrow && (
          <div className="page-eyebrow">
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
              }}
            />
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
