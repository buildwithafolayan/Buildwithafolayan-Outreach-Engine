const variantMap: Record<string, string> = {
  // Campaign states
  DRAFT: "badge-neutral",
  ACTIVE: "badge-success",
  PAUSED: "badge-warning",
  ARCHIVED: "badge-neutral",

  // Enrollment states
  ENROLLED: "badge-info",
  SCHEDULED: "badge-info",
  SENDING: "badge-info",
  WAITING: "badge-neutral",
  REPLIED: "badge-success",
  COMPLETED: "badge-neutral",
  ERROR: "badge-danger",
  BOUNCED: "badge-danger",
  UNSUBSCRIBED: "badge-danger",
  MANUALLY_STOPPED: "badge-neutral",

  // Contact states
  NEW: "badge-info",
  READY: "badge-info",
  CONTACTED: "badge-neutral",
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
  className?: string;
}

export default function StatusBadge({ status, showDot = true, className = "" }: StatusBadgeProps) {
  const variant = variantMap[status] ?? "badge-neutral";
  const label = status.replace(/_/g, " ");

  return (
    <span className={`badge ${variant} ${className}`}>
      {showDot && <span className="badge-dot" />}
      {label}
    </span>
  );
}
