import type { Metadata } from "next";
import Header from "../components/Header";
import Card from "../components/Card";

export const metadata: Metadata = {
  title: "Analytics",
};

const overviewStats = [
  { label: "Total Emails Sent", value: "230", sub: "Across all campaigns" },
  { label: "Total Replies", value: "27", sub: "11.7% overall reply rate" },
  { label: "Positive Outcomes", value: "14", sub: "51.9% of replies" },
  { label: "Active Contacts", value: "36", sub: "Currently in sequences" },
];

const campaignPerformance = [
  { name: "Q3 Developer Outreach", sent: 38, replied: 6, rate: "15.8%", positive: 4, status: "ACTIVE" },
  { name: "Conference Follow-up 2026", sent: 12, replied: 3, rate: "25.0%", positive: 2, status: "PAUSED" },
  { name: "Q2 Agency Partners", sent: 180, replied: 18, rate: "10.0%", positive: 8, status: "ARCHIVED" },
];

// Generate chart bar heights
const weeklyData = [35, 52, 28, 64, 41, 73, 56, 48, 62, 39, 71, 45];

export default function AnalyticsPage() {
  return (
    <div className="animate-in">
      <Header
        eyebrow="Analytics"
        title="Performance overview"
        description="Track send volume, reply rates, and campaign effectiveness across your outreach."
        actions={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button className="filter-chip active">Last 30 days</button>
            <button className="filter-chip">Last 7 days</button>
            <button className="filter-chip">All time</button>
          </div>
        }
      />

      {/* Overview Stats */}
      <div className="stat-grid" style={{ marginBottom: "var(--space-8)" }}>
        {overviewStats.map(({ label, value, sub }) => (
          <div className="stat-card" key={label}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-sub">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Send Volume Chart */}
        <Card>
          <h3 className="section-title" style={{ marginBottom: "var(--space-5)" }}>Weekly Send Volume</h3>
          <div className="chart-placeholder">
            {weeklyData.map((h, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-3)", fontSize: "11px", color: "var(--text-muted)" }}>
            <span>12 weeks ago</span>
            <span>This week</span>
          </div>
        </Card>

        {/* Reply Rate Chart */}
        <Card>
          <h3 className="section-title" style={{ marginBottom: "var(--space-5)" }}>Reply Rate Trend</h3>
          <div className="chart-placeholder">
            {[18, 12, 22, 15, 28, 20, 35, 25, 30, 22, 27, 32].map((h, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 50}ms`,
                  background: "linear-gradient(180deg, var(--success), hsl(160 60% 35%))",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-3)", fontSize: "11px", color: "var(--text-muted)" }}>
            <span>12 weeks ago</span>
            <span>This week</span>
          </div>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Campaign Performance</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Sent</th>
                <th>Replied</th>
                <th>Reply Rate</th>
                <th>Positive</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((c) => (
                <tr key={c.name}>
                  <td className="table-name">{c.name}</td>
                  <td>{c.sent}</td>
                  <td>{c.replied}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{c.rate}</td>
                  <td>{c.positive}</td>
                  <td>
                    <span className={`badge ${
                      c.status === "ACTIVE" ? "badge-success" :
                      c.status === "PAUSED" ? "badge-warning" : "badge-neutral"
                    }`}>
                      <span className="badge-dot" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outcome Breakdown */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Reply Outcomes</h2>
        </div>
        <div className="stat-grid">
          {[
            { label: "Positive", value: "14", color: "var(--success)" },
            { label: "Negative", value: "5", color: "var(--danger)" },
            { label: "Neutral", value: "3", color: "var(--text-secondary)" },
            { label: "Out of Office", value: "3", color: "var(--warning)" },
            { label: "Unsubscribed", value: "2", color: "var(--danger)" },
          ].map(({ label, value, color }) => (
            <div className="stat-card" key={label} style={{ "--stat-accent": color } as React.CSSProperties}>
              <p className="stat-label">{label}</p>
              <p className="stat-value" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
