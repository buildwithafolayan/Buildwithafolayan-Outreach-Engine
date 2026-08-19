"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  UserPlus,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
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
    const prevStatus = campaign.status;

    setCampaign({ ...campaign, status: nextStatus });

    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Failed to persist campaign status:", data.error);
        setCampaign((prev) => (prev ? { ...prev, status: prevStatus } : null));
      }
    } catch (err) {
      console.error("Error persisting campaign status:", err);
      setCampaign((prev) => (prev ? { ...prev, status: prevStatus } : null));
    }
  };

  if (!campaign && !loading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Campaign not found.</p>
        <Link href="/campaigns" className="btn btn-secondary" style={{ marginTop: "12px" }}>
          <ArrowLeft size={14} strokeWidth={2} />
          <span>Back to Campaigns</span>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb */}
      <div className="page-eyebrow">
        <Link href="/campaigns" style={{ color: "var(--text-tertiary)" }}>
          Campaigns
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{campaign?.name}</span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 className="page-title">{campaign?.name}</h1>
            {campaign && <StatusBadge status={campaign.status} />}
          </div>
          <p className="page-description">{campaign?.description}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={toggleCampaignStatus}
          >
            {campaign?.status === "ACTIVE" ? (
              <>
                <Pause size={13} strokeWidth={2} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={13} strokeWidth={2} />
                <span>Resume</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowEnrollModal(true)}
          >
            <UserPlus size={14} strokeWidth={2} />
            <span>Enroll Prospects</span>
          </button>
        </div>
      </div>

      {/* Metric Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>Enrolled Prospects</span>
            <UserPlus size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="stat-value">{campaign?.enrolledCount || enrolledContacts.length}</div>
          <div className="stat-sub">Target list</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Emails Dispatched</span>
            <Send size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="stat-value">{campaign?.sentCount || 0}</div>
          <div className="stat-sub">Via Gmail API</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Replies Detected</span>
            <MessageSquare size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="stat-value" style={{ color: "#34d399" }}>
            {campaign?.repliedCount || 0}
          </div>
          <div className="stat-sub">Sequence auto-paused</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Reply Rate</span>
            <Mail size={14} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="stat-value">{campaign?.replyRate || "0.0%"}</div>
          <div className="stat-sub">Positive conversion</div>
        </div>
      </div>

      {/* Sequence Cadence Steps */}
      <div className="card">
        <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "14px" }}>
          Cadence Steps ({steps.length})
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {steps.map((s) => (
            <div
              key={s.number}
              style={{
                padding: "14px 16px",
                backgroundColor: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                gap: "14px",
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
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                }}
              >
                {s.number}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {s.subject}
                  </h4>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {s.delayDescription}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "12px",
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

      {/* Enrolled Prospects Table */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>
            Enrolled Prospects ({enrolledContacts.length})
          </h3>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowEnrollModal(true)}
          >
            <UserPlus size={13} strokeWidth={2} />
            <span>Add Prospects</span>
          </button>
        </div>

        {enrolledContacts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {enrolledContacts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Link
                    href={`/contacts/${c.id}`}
                    style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                  <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                    {c.email} · {c.company}
                  </p>
                </div>
                <StatusBadge status={c.state} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", textAlign: "center", padding: "16px" }}>
            No contacts enrolled in this sequence yet.
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
