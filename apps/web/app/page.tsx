import type { Metadata } from "next";
import Header from "./components/Header";
import StatusBadge from "./components/StatusBadge";

export const metadata: Metadata = {
  title: "Dashboard",
};

const stats = [
  { label: "Total Contacts", value: "0", sub: "No contacts imported yet", accent: "--info" },
  { label: "Active Campaigns", value: "0", sub: "Create your first campaign", accent: "--accent" },
  { label: "Emails Sent", value: "0", sub: "Sending is paused", accent: "--success" },
  { label: "Reply Rate", value: "—", sub: "No data yet", accent: "--warning" },
];

const attentionItems = [
  { icon: "📩", title: "New Replies", count: 0, description: "No replies to review" },
  { icon: "⚠️", title: "Failed Sends", count: 0, description: "No failed deliveries" },
  { icon: "⏸", title: "Paused Campaigns", count: 0, description: "No paused campaigns" },
];

const recentEvents = [
  {
    icon: "🚀",
    dotClass: "dot-info",
    event: "System initialized",
    meta: "Outreach Engine is set up and ready. Global sending is paused.",
    time: "Just now",
  },
  {
    icon: "🔒",
    dotClass: "",
    event: "Global sending disabled",
    meta: "Sending will remain off until you connect Gmail and run a controlled test.",
    time: "Setup",
  },
  {
    icon: "📋",
    dotClass: "",
    event: "Architecture package complete",
    meta: "Database design, API contract, security model, and development plan are in place.",
    time: "Phase 0",
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-in">
      <Header
        eyebrow="Private Gmail Outreach"
        title="Good to have you here."
        description="The engine is set up safely. Gmail sending stays off until you connect an account and complete a controlled test."
        actions={<StatusBadge status="PAUSED" />}
      />

      {/* Global sending banner */}
      <div className="attention-banner banner-warning">
        <div className="attention-content">
          <p className="attention-title">⚡ Global Sending is Paused</p>
          <p className="attention-description">
            Connect your Gmail account to begin. The first outreach will be to a controlled test recipient only.
          </p>
        </div>
        <button className="btn btn-primary" disabled>Connect Gmail</button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ label, value, sub }) => (
          <div className="stat-card" key={label}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-sub">{sub}</p>
          </div>
        ))}
      </div>

      {/* Attention items */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Needs Attention</h2>
        </div>
        <div className="grid-3">
          {attentionItems.map(({ icon, title, count, description }) => (
            <div className="card" key={title}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "24px" }}>{icon}</span>
                <span className="stat-value" style={{ fontSize: "22px" }}>{count}</span>
              </div>
              <p style={{ fontWeight: 620, marginBottom: "var(--space-1)" }}>{title}</p>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
        </div>
        <div className="card">
          <div className="timeline">
            {recentEvents.map(({ icon, dotClass, event, meta, time }) => (
              <div className="timeline-item" key={event}>
                <div className={`timeline-dot ${dotClass}`}>{icon}</div>
                <div className="timeline-content">
                  <p className="timeline-event">{event}</p>
                  <p className="timeline-meta">{meta}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Getting Started</h2>
        </div>
        <div className="grid-3">
          <div className="card card-interactive">
            <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>1</div>
            <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>Connect Gmail</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Link your Gmail account via OAuth. Your refresh token is encrypted at rest.
            </p>
          </div>
          <div className="card card-interactive">
            <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>2</div>
            <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>Import Contacts</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Upload a CSV of your B2B outreach targets. Each row is validated and deduplicated.
            </p>
          </div>
          <div className="card card-interactive">
            <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>3</div>
            <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>Launch Campaign</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Create a sequence, enroll contacts, and run a controlled test before going live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
