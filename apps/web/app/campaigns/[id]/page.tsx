"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import Card from "../../components/Card";
import EnrollContactsModal from "@/app/components/EnrollContactsModal";
import AISequenceGenerator from "@/app/components/AISequenceGenerator";

interface SequenceStep {
  number: number;
  subject: string;
  bodyText: string;
  delayDays: number;
  delayDescription: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  description: string;
  gmailAccount?: string;
  dailyLimit: number;
  hourlyLimit: number;
  steps: SequenceStep[];
  enrolledCount: number;
  sentCount: number;
  repliedCount: number;
  replyRate: string;
  createdAt: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  state: string;
  lastActivity?: string;
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [enrolledContacts, setEnrolledContacts] = useState<Contact[]>([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCampaignData = async () => {
    try {
      const [campRes, contRes] = await Promise.all([
        fetch("/api/campaigns"),
        fetch("/api/contacts"),
      ]);

      const campData = await campRes.json();
      if (campData.campaigns) {
        const found = campData.campaigns.find((c: Campaign) => c.id === id);
        if (found) setCampaign(found);
        else if (campData.campaigns.length > 0) setCampaign(campData.campaigns[0]);
      }

      const contData = await contRes.json();
      if (contData.contacts) {
        setEnrolledContacts(
          contData.contacts.filter((c: Contact) => c.state === "ENROLLED" || c.state === "REPLIED")
        );
      }
    } catch (e) {
      console.error("Failed to load campaign detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const toggleCampaignStatus = async () => {
    if (!campaign) return;
    const nextStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setCampaign({ ...campaign, status: nextStatus });
  };

  if (!campaign && !loading) {
    return (
      <div className="animate-in" style={{ padding: "40px 0" }}>
        <p>Campaign not found.</p>
        <Link href="/campaigns" className="btn btn-secondary" style={{ marginTop: "16px" }}>
          ← Back to Campaigns
        </Link>
      </div>
    );
  }

  const steps = campaign?.steps || [
    {
      number: 1,
      subject: "Helping {{company}} ship faster",
      delayDescription: "Immediate",
      bodyText: "Hi {{first_name}},\n\nI noticed {{company}} is scaling its engineering team...",
      delayDays: 0,
    },
    {
      number: 2,
      subject: "Quick follow-up on developer tools",
      delayDescription: "3 days after Step 1",
      bodyText: "Hi {{first_name}},\n\nJust wanted to follow up on my previous note...",
      delayDays: 3,
    },
  ];

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <p className="page-eyebrow" style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/campaigns" style={{ color: "var(--text-tertiary)" }}>
          Campaigns
        </Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>/</span>
        <span>{campaign?.name}</span>
      </p>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "var(--space-8)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h1 className="page-title">{campaign?.name}</h1>
            {campaign && <StatusBadge status={campaign.status} />}
          </div>
          <p className="page-description">{campaign?.description}</p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: "var(--space-2)" }}>
          <button className="btn btn-secondary" onClick={toggleCampaignStatus}>
            {campaign?.status === "ACTIVE" ? "⏸ Pause Campaign" : "▶ Resume Campaign"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowEnrollModal(true)}
          >
            + Enroll Contacts
          </button>
        </div>
      </div>

      {/* Campaign Metrics */}
      <div className="stat-grid" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stat-card">
          <p className="stat-label">Enrolled</p>
          <p className="stat-value">{campaign?.enrolledCount || enrolledContacts.length}</p>
          <p className="stat-sub">Target prospects</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Emails Sent</p>
          <p className="stat-value">{campaign?.sentCount || 0}</p>
          <p className="stat-sub">Via connected Gmail</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Replies</p>
          <p className="stat-value">{campaign?.repliedCount || 0}</p>
          <p className="stat-sub">Auto-paused sequences</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Reply Rate</p>
          <p className="stat-value">{campaign?.replyRate || "—"}</p>
          <p className="stat-sub">Positive sentiment tracked</p>
        </div>
      </div>

      {/* Sequence Steps */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Sequence Steps ({steps.length})</h2>
        </div>
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {steps.map((s) => (
            <div key={s.number} className="step-card">
              <div className="step-number">{s.number}</div>
              <div className="step-content">
                <p className="step-subject">{s.subject}</p>
                <p className="step-delay">{s.delayDescription}</p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    marginTop: "var(--space-2)",
                    fontFamily: "var(--font-mono)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.bodyText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Contacts Table */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Enrolled Contacts ({enrolledContacts.length})</h2>
          <button
            className="btn btn-secondary"
            style={{ fontSize: "12px" }}
            onClick={() => setShowEnrollModal(true)}
          >
            + Add Contacts
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>State</th>
                <th>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledContacts.length > 0 ? (
                enrolledContacts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/contacts/${c.id}`} className="table-name">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td><span className="table-email">{c.email}</span></td>
                    <td>{c.company}</td>
                    <td><StatusBadge status={c.state} /></td>
                    <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                      {c.lastActivity || "Step 1 queued"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-tertiary)" }}>
                    No contacts enrolled yet. Click &ldquo;+ Enroll Contacts&rdquo; to assign prospects.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Sequence Generator Assistant */}
      <AISequenceGenerator campaignName={campaign?.name || "Outreach Campaign"} />

      {/* Modal */}
      {campaign && (
        <EnrollContactsModal
          campaignId={campaign.id}
          campaignName={campaign.name}
          isOpen={showEnrollModal}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={loadCampaignData}
        />
      )}
    </div>
  );
}
