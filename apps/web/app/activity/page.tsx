import type { Metadata } from "next";
import {
  MessageSquare,
  Send,
  Pause,
  UserPlus,
  UploadCloud,
  Link2,
  Play,
  ShieldCheck,
} from "lucide-react";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Activity",
};

const eventTypes = ["All Events", "Emails Sent", "Replies", "Pauses", "Errors", "System"];

const events = [
  {
    icon: MessageSquare,
    event: "Reply received from Sarah Chen",
    meta: "Q3 Developer Outreach · Step 2 · Positive sentiment detected",
    time: "2 min ago",
    badgeColor: "#34d399",
  },
  {
    icon: Send,
    event: "Email sent to David Kim",
    meta: "Q3 Developer Outreach · Step 2 · Subject: Quick follow-up on developer tools",
    time: "1 hour ago",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: Pause,
    event: "Enrollment paused — Sarah Chen",
    meta: "Q3 Developer Outreach · Reason: Reply detected · All pending sends cancelled",
    time: "2 min ago",
    badgeColor: "#fbbf24",
  },
  {
    icon: Send,
    event: "Email sent to Tom Rivera",
    meta: "Q3 Developer Outreach · Step 1 · Subject: Helping BuildFast ship faster",
    time: "3 hours ago",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: Send,
    event: "Email sent to Priya Sharma",
    meta: "Q3 Developer Outreach · Step 2 · Subject: Quick follow-up on developer tools",
    time: "5 hours ago",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: UserPlus,
    event: "3 contacts enrolled in Q3 Developer Outreach",
    meta: "Tom Rivera, Priya Sharma, Lisa Park · Scheduled for working hours",
    time: "Yesterday",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: UploadCloud,
    event: "CSV import completed",
    meta: "q3-targets.csv · 24 imported, 2 duplicates skipped",
    time: "2 days ago",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: Link2,
    event: "Gmail account connected",
    meta: "Operator account verified via OAuth 2.0",
    time: "3 days ago",
    badgeColor: "#34d399",
  },
  {
    icon: Play,
    event: "Campaign activated — Q3 Developer Outreach",
    meta: "4 steps · 24 contacts enrolled · First sends scheduled",
    time: "3 days ago",
    badgeColor: "var(--text-secondary)",
  },
  {
    icon: ShieldCheck,
    event: "Global sending enabled",
    meta: "Safety guardrails active · Rate limits: 20/day, 5/hour",
    time: "3 days ago",
    badgeColor: "#34d399",
  },
];

export default function ActivityPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Header
        eyebrow="Audit Log"
        title="Activity Stream"
        description="Chronological log of outreach dispatches, reply triggers, and operator actions."
      />

      {/* Filter Chips */}
      <div className="filter-bar">
        {eventTypes.map((f, i) => (
          <button key={f} type="button" className={`filter-chip${i === 0 ? " active" : ""}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Timeline Card */}
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map(({ icon: Icon, event, meta, time, badgeColor }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: badgeColor,
                  flexShrink: 0,
                }}
              >
                <Icon size={13} strokeWidth={1.75} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {event}
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "1px" }}>
                  {meta}
                </p>
              </div>

              <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                {time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
