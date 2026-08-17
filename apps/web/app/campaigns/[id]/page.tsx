import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import Card from "../../components/Card";
import AISequenceGenerator from "@/app/components/AISequenceGenerator";

export const metadata: Metadata = {
  title: "Campaign Detail",
};

const campaign = {
  id: "camp1",
  name: "Q3 Developer Outreach",
  status: "ACTIVE",
  description: "Targeted outreach to engineering leaders at mid-stage SaaS companies for our developer tools platform.",
  gmail: "hello@yourdomain.com",
  dailyLimit: 20,
  hourlyLimit: 5,
  created: "Aug 8, 2026",
};

const steps = [
  { number: 1, subject: "Helping {{company}} ship faster", delay: "Immediate", preview: "Hi {{first_name}}, I noticed {{company}} is scaling its engineering team..." },
  { number: 2, subject: "Quick follow-up on developer tools", delay: "3 days after Step 1", preview: "Hi {{first_name}}, just wanted to follow up on my previous note..." },
  { number: 3, subject: "Case study: How teams like {{company}} save 40% dev time", delay: "5 days after Step 2", preview: "Hi {{first_name}}, I thought you might find this relevant..." },
  { number: 4, subject: "Last note — happy to help when the timing is right", delay: "7 days after Step 3", preview: "Hi {{first_name}}, I know timing is everything..." },
];

const enrolledContacts = [
  { name: "Sarah Chen", email: "sarah@techcorp.io", state: "REPLIED", step: "Step 2", lastAction: "Reply received" },
  { name: "David Kim", email: "david@scalehouse.co", state: "WAITING", step: "Step 2", lastAction: "Sent yesterday" },
  { name: "Priya Sharma", email: "priya@cloudnine.dev", state: "SCHEDULED", step: "Step 3", lastAction: "Sends tomorrow 9:15 AM" },
  { name: "Tom Rivera", email: "tom@buildfast.io", state: "WAITING", step: "Step 1", lastAction: "Sent 2 days ago" },
  { name: "Lisa Park", email: "lisa@devhub.com", state: "COMPLETED", step: "Step 4", lastAction: "Sequence complete" },
];

const metrics = [
  { label: "Enrolled", value: "24" },
  { label: "Emails Sent", value: "38" },
  { label: "Replies", value: "6" },
  { label: "Reply Rate", value: "15.8%" },
  { label: "Positive", value: "4" },
  { label: "Completion Rate", value: "20.8%" },
];

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  await params;

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <p className="page-eyebrow" style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/campaigns" style={{ color: "var(--text-tertiary)" }}>Campaigns</Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>/</span>
        <span>{campaign.name}</span>
      </p>

      {/* Campaign header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-8)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="page-description">{campaign.description}</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
            Created {campaign.created} · Sending from {campaign.gmail}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button className="btn btn-secondary">Pause</button>
          <button className="btn btn-primary">Enroll Contacts</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="stat-grid" style={{ marginBottom: "var(--space-8)" }}>
        {metrics.map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left — Sequence Steps */}
        <div>
          <div className="section-header" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
            <h2 className="section-title">Sequence Steps</h2>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <AISequenceGenerator campaignName={campaign.name} />
              <button className="btn btn-secondary">Edit Steps</button>
            </div>
          </div>
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {steps.map((s) => (
              <div className="step-card" key={s.number}>
                <div className="step-number">{s.number}</div>
                <div className="step-content">
                  <p className="step-subject">{s.subject}</p>
                  <p className="step-delay">{s.delay}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--space-2)", lineHeight: 1.5 }}>
                    {s.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Enrolled Contacts */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Enrolled Contacts</h2>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{enrolledContacts.length} contacts</span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Step</th>
                  <th>State</th>
                  <th>Last Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledContacts.map((c) => (
                  <tr key={c.email}>
                    <td>
                      <div>
                        <p className="table-name">{c.name}</p>
                        <p className="table-email">{c.email}</p>
                      </div>
                    </td>
                    <td>{c.step}</td>
                    <td><StatusBadge status={c.state} /></td>
                    <td style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{c.lastAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Campaign Settings */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <Card>
              <h3 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Campaign Settings</h3>
              <div style={{ display: "grid", gap: "var(--space-3)" }}>
                {[
                  ["Daily Limit", `${campaign.dailyLimit} emails/day`],
                  ["Hourly Limit", `${campaign.hourlyLimit} emails/hour`],
                  ["Gmail Account", campaign.gmail],
                  ["Status", campaign.status],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
                    <span style={{ fontWeight: 540, fontFamily: "var(--font-mono)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
