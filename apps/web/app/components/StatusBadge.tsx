const variantMap: Record<string, string> = {
  // Campaign states
  DRAFT: "badge-neutral",
  ACTIVE: "badge-success",
  PAUSED: "badge-warning",
  ARCHIVED: "badge-neutral",

  // Enrollment states
  ENROLLED: "badge-info",
  SCHEDULED: "badge-accent",
  SENDING: "badge-accent",
  WAITING: "badge-info",
  REPLIED: "badge-success",
  COMPLETED: "badge-success",
  ERROR: "badge-danger",
  BOUNCED: "badge-danger",
  UNSUBSCRIBED: "badge-danger",
  MANUALLY_STOPPED: "badge-neutral",

  // Contact states
  NEW: "badge-info",
  READY: "badge-accent",
  CONTACTED: "badge-info",
  FOLLOW_UP_PENDING: "badge-warning",
  POSITIVE: "badge-success",
  NEGATIVE: "badge-danger",

  // Gmail
  CONNECTED: "badge-success",
  DISCONNECTED: "badge-neutral",
  REAUTH_REQUIRED: "badge-warning",
};

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
}

export default function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const variant = variantMap[status] ?? "badge-neutral";
  const label = status.replace(/_/g, " ");

  return (
    <span className={`badge ${variant}`}>
      {showDot && <span className="badge-dot" />}
      {label}
    </span>
  );
}
