import type { Metadata } from "next";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Activity",
};

const eventTypes = ["All Events", "Emails Sent", "Replies", "Pauses", "Errors", "System"];

const events = [
  {
    icon: "📩",
    dotClass: "dot-success",
    event: "Reply received from Sarah Chen",
    meta: "Q3 Developer Outreach · Step 2 · Positive sentiment detected",
    time: "2 min ago",
    type: "reply",
  },
  {
    icon: "✉️",
    dotClass: "dot-info",
    event: "Email sent to David Kim",
    meta: "Q3 Developer Outreach · Step 2 · Subject: Quick follow-up on developer tools",
    time: "1 hour ago",
    type: "send",
  },
  {
    icon: "⏸",
    dotClass: "dot-warning",
    event: "Enrollment paused — Sarah Chen",
    meta: "Q3 Developer Outreach · Reason: Reply detected · All pending sends cancelled",
    time: "2 min ago",
    type: "pause",
  },
  {
    icon: "✉️",
    dotClass: "dot-info",
    event: "Email sent to Tom Rivera",
    meta: "Q3 Developer Outreach · Step 1 · Subject: Helping BuildFast ship faster",
    time: "3 hours ago",
    type: "send",
  },
  {
    icon: "✉️",
    dotClass: "dot-info",
    event: "Email sent to Priya Sharma",
    meta: "Q3 Developer Outreach · Step 2 · Subject: Quick follow-up on developer tools",
    time: "5 hours ago",
    type: "send",
  },
  {
    icon: "📋",
    dotClass: "",
    event: "3 contacts enrolled in Q3 Developer Outreach",
    meta: "Tom Rivera, Priya Sharma, Lisa Park · Scheduled for working hours",
    time: "Yesterday",
    type: "system",
  },
  {
    icon: "⬆️",
    dotClass: "",
    event: "CSV import completed",
    meta: "q3-targets.csv · 24 imported, 2 duplicates skipped, 1 invalid",
    time: "2 days ago",
    type: "system",
  },
  {
    icon: "🔗",
    dotClass: "dot-success",
    event: "Gmail account connected",
    meta: "hello@yourdomain.com · OAuth verified · Watch established",
    time: "3 days ago",
    type: "system",
  },
  {
    icon: "🚀",
    dotClass: "dot-info",
    event: "Campaign activated — Q3 Developer Outreach",
    meta: "4 steps · 24 contacts enrolled · First sends scheduled",
    time: "3 days ago",
    type: "system",
  },
  {
    icon: "🔒",
    dotClass: "",
    event: "Global sending enabled",
    meta: "Controlled test passed · Rate limits active: 20/day, 5/hour",
    time: "3 days ago",
    type: "system",
  },
];

export default function ActivityPage() {
  return (
    <div className="animate-in">
      <Header
        eyebrow="Activity"
        title="Activity feed"
        description="A chronological record of every action across your campaigns, contacts, and system."
      />

      {/* Filters */}
      <div className="filter-bar">
        {eventTypes.map((f) => (
          <button key={f} className={`filter-chip${f === "All Events" ? " active" : ""}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="timeline">
          {events.map(({ icon, dotClass, event, meta, time }, i) => (
            <div className="timeline-item" key={i}>
              <div className={`timeline-dot ${dotClass}`}>{icon}</div>
              <div className="timeline-content">
                <p className="timeline-event">{event}</p>
                <p className="timeline-meta">{meta}</p>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Load more */}
      <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
        <button className="btn btn-secondary">Load More Events</button>
      </div>
    </div>
  );
}
