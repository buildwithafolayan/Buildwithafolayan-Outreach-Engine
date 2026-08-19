import type { Metadata } from "next";
import { BarChart3, TrendingUp, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";

export const metadata: Metadata = {
  title: "Analytics",
};

const overviewStats = [
  { label: "Total Emails Dispatched", value: "230", sub: "All active cadences", icon: Send },
  { label: "Detected Replies", value: "27", sub: "11.7% overall response rate", icon: MessageSquare },
  { label: "Positive Conversions", value: "14", sub: "51.9% of total replies", icon: CheckCircle2 },
  { label: "Enrolled Targets", value: "36", sub: "Currently scheduled", icon: TrendingUp },
];

const campaignPerformance = [
  { name: "Q3 Developer Outreach", sent: 38, replied: 6, rate: "15.8%", positive: 4, status: "ACTIVE" },
  { name: "Conference Follow-up 2026", sent: 12, replied: 3, rate: "25.0%", positive: 2, status: "PAUSED" },
  { name: "Q2 Agency Partners", sent: 180, replied: 18, rate: "10.0%", positive: 8, status: "ARCHIVED" },
];

const weeklyData = [35, 52, 28, 64, 41, 73, 56, 48, 62, 39, 71, 45];
const replyData = [18, 12, 22, 15, 28, 20, 35, 25, 30, 22, 27, 32];

export default function AnalyticsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Header
        eyebrow="Intelligence"
        title="Performance Analytics"
        description="Dispatch volume, reply rates, and conversion effectiveness across cadences."
        actions={
          <div className="filter-bar">
            <button type="button" className="filter-chip active">Last 30 days</button>
            <button type="button" className="filter-chip">Last 7 days</button>
            <button type="button" className="filter-chip">All time</button>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="stat-grid">
        {overviewStats.map(({ label, value, sub, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">
              <span>{label}</span>
              <Icon size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Visual Volume Trends */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Send Volume Chart */}
        <div className="card">
          <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "16px" }}>
            Weekly Dispatch Volume
          </h3>
          <div
            style={{
              height: "100px",
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {weeklyData.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  backgroundColor: "#fafafa",
                  borderRadius: "2px 2px 0 0",
                  opacity: 0.85,
                }}
                title={`Week ${i + 1}: ${h} sends`}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            <span>12 weeks ago</span>
            <span>Current week</span>
          </div>
        </div>

        {/* Reply Rate Chart */}
        <div className="card">
          <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "16px" }}>
            Reply Rate Velocity (%)
          </h3>
          <div
            style={{
              height: "100px",
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {replyData.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  backgroundColor: "#10b981",
                  borderRadius: "2px 2px 0 0",
                  opacity: 0.85,
                }}
                title={`Week ${i + 1}: ${h}% replies`}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            <span>12 weeks ago</span>
            <span>Current week</span>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>
            Cadence Breakdown
          </h3>
        </div>
        <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Sequence Name</th>
                <th>Dispatched</th>
                <th>Replies</th>
                <th>Reply Rate</th>
                <th>Positive</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                  <td>{c.sent}</td>
                  <td>{c.replied}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{c.rate}</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>{c.positive}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
