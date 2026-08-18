"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
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
      <div style={{ padding: "40px 0" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Apple Eyebrow & Breadcrumb */}
      <div className="page-eyebrow">
        <Link href="/campaigns" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>
          Campaigns
        </Link>
        <span style={{ color: "var(--text-tertiary)" }}>/</span>
        <span style={{ color: "#ffffff" }}>{campaign?.name}</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 className="page-title">{campaign?.name}</h1>
            {campaign && <StatusBadge status={campaign.status} />}
          </div>
          <p className="page-description">{campaign?.description}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
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

      {/* 4 Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="ios-glass" style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Enrolled</span>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", margin: "4px 0" }}>
            {campaign?.enrolledCount || enrolledContacts.length}
          </p>
          <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Target prospects</span>
        </div>

        <div className="ios-glass" style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Emails Sent</span>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent)", margin: "4px 0" }}>
            {campaign?.sentCount || 0}
          </p>
          <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Via connected Gmail</span>
        </div>

        <div className="ios-glass" style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Replies</span>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--success)", margin: "4px 0" }}>
            {campaign?.repliedCount || 0}
          </p>
          <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Auto-paused sequences</span>
        </div>

        <div className="ios-glass" style={{ padding: "20px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Reply Rate</span>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--warning)", margin: "4px 0" }}>
            {campaign?.replyRate || "15.8%"}
          </p>
          <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>Positive sentiment tracked</span>
        </div>
      </div>

      {/* Sequence Steps Section */}
      <div className="ios-glass" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 750, marginBottom: "16px", color: "#ffffff" }}>
          Sequence Steps ({steps.length})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {steps.map((s) => (
            <div
              key={s.number}
              style={{
                padding: "18px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-default)",
                borderRadius: "14px",
                display: "flex",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                {s.number}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                    {s.subject}
                  </h4>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      background: "rgba(255, 255, 255, 0.08)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {s.delayDescription}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                    whiteSpace: "pre-line",
                    lineHeight: 1.5,
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
      <div className="ios-glass" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 750, color: "#ffffff" }}>
            Enrolled Prospects ({enrolledContacts.length})
          </h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEnrollModal(true)}
          >
            + Add Prospects
          </button>
        </div>

        {enrolledContacts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {enrolledContacts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Link
                    href={`/contacts/${c.id}`}
                    style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff", textDecoration: "none" }}
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {c.email} · {c.company}
                  </p>
                </div>
                <StatusBadge status={c.state} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", textAlign: "center", padding: "20px" }}>
            No contacts enrolled yet. Click &ldquo;+ Enroll Contacts&rdquo; to assign prospects.
          </p>
        )}
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
