import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

export const metadata: Metadata = {
  title: "Campaigns",
};

const campaigns = [
  {
    id: "camp1",
    name: "Q3 Developer Outreach",
    status: "ACTIVE",
    steps: 4,
    enrolled: 24,
    sent: 38,
    replied: 6,
    replyRate: "15.8%",
    nextAction: "3 sends scheduled for tomorrow",
  },
  {
    id: "camp2",
    name: "Product Launch — Enterprise",
    status: "DRAFT",
    steps: 3,
    enrolled: 0,
    sent: 0,
    replied: 0,
    replyRate: "—",
    nextAction: "Waiting for step templates",
  },
  {
    id: "camp3",
    name: "Conference Follow-up 2026",
    status: "PAUSED",
    steps: 2,
    enrolled: 12,
    sent: 12,
    replied: 3,
    replyRate: "25.0%",
    nextAction: "Paused — reviewing replies",
  },
  {
    id: "camp4",
    name: "Q2 Agency Partners",
    status: "ARCHIVED",
    steps: 5,
    enrolled: 45,
    sent: 180,
    replied: 18,
    replyRate: "10.0%",
    nextAction: "Completed",
  },
];

const filters = ["All", "Active", "Draft", "Paused", "Archived"];

export default function CampaignsPage() {
  const isEmpty = false;

  return (
    <div className="animate-in">
      <Header
        eyebrow="Campaigns"
        title="Outreach campaigns"
        description="Create sequenced email campaigns, manage enrollment, and track performance."
        actions={<button className="btn btn-primary">Create Campaign</button>}
      />

      {isEmpty ? (
        <EmptyState
          icon="◈"
          title="No campaigns yet"
          description="Create your first campaign to start reaching out to your contacts with sequenced emails."
          action={<button className="btn btn-primary">Create Your First Campaign</button>}
        />
      ) : (
        <>
          <div className="filter-bar">
            {filters.map((f) => (
              <button key={f} className={`filter-chip${f === "All" ? " active" : ""}`}>
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {campaigns.map((c) => (
              <Link href={`/campaigns/${c.id}`} key={c.id} style={{ textDecoration: "none" }}>
                <div className="card card-interactive">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 660, marginBottom: "var(--space-1)" }}>{c.name}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{c.steps} steps · {c.nextAction}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Enrolled</p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.enrolled}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Sent</p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.sent}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Replied</p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.replied}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Reply Rate</p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.replyRate}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
