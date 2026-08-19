import type { ReactNode, ElementType } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ElementType | string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        backgroundColor: "var(--bg-surface)",
        border: "1px dashed var(--border-default)",
        borderRadius: "var(--radius-md)",
      }}
      className="animate-in"
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          marginBottom: "12px",
        }}
      >
        {typeof Icon === "function" ? (
          <Icon size={20} strokeWidth={1.75} />
        ) : (
          <Inbox size={20} strokeWidth={1.75} />
        )}
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "4px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", maxWidth: "360px", marginBottom: action ? "16px" : "0" }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
