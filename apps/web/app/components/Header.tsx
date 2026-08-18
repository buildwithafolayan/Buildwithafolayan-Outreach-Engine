import type { ReactNode } from "react";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function Header({ eyebrow, title, description, actions }: HeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        {eyebrow && (
          <div className="page-eyebrow">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent)",
              }}
            />
            {eyebrow}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
