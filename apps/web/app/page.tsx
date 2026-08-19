"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Send,
  Mail,
  Zap,
  UploadCloud,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Header from "./components/Header";
import CreateCampaignModal from "./components/CreateCampaignModal";
import ImportCSVModal from "./components/ImportCSVModal";
import StatusBadge from "./components/StatusBadge";

interface Account {
  email: string;
  name?: string;
  picture?: string;
  connectedAt: string;
  status: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  state: string;
  industry?: string;
  city?: string;
  notes?: string;
  createdAt: string;
  lastActivity?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  sentCount: number;
  repliedCount: number;
  enrolledCount: number;
  replyRate: string;
}

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [globalSending, setGlobalSending] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);

  const loadData = async () => {
    try {
      const [accRes, contRes, campRes, setRes] = await Promise.all([
        fetch("/api/gmail/account"),
        fetch("/api/contacts"),
        fetch("/api/campaigns"),
        fetch("/api/settings"),
      ]);

      const accData = await accRes.json();
      if (accData.account) setAccount(accData.account);

      const contData = await contRes.json();
      if (contData.contacts) setContacts(contData.contacts);

      const campData = await campRes.json();
      if (campData.campaigns) setCampaigns(campData.campaigns);

      const setData = await setRes.json();
      if (setData.settings) setGlobalSending(setData.settings.globalSendingEnabled);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalContacts = contacts.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + (c.repliedCount || 0), 0);
  const replyRateStr =
    totalSent > 0 ? `${((totalReplied / totalSent) * 100).toFixed(1)}%` : "0.0%";

  const stats = [
    {
      label: "Total Prospects",
      value: String(totalContacts),
      sub: totalContacts > 0 ? `${totalContacts} enrolled targets` : "No targets yet",
      icon: Users,
    },
    {
      label: "Active Campaigns",
      value: String(activeCampaigns),
      sub: activeCampaigns > 0 ? `${activeCampaigns} active sequences` : "0 running",
      icon: Send,
    },
    {
      label: "Dispatched Emails",
      value: String(totalSent),
      sub: globalSending ? "Outreach window open" : "Engine paused",
      icon: Mail,
    },
    {
      label: "Positive Reply Rate",
      value: replyRateStr,
      sub: `${totalReplied} responses recorded`,
      icon: Zap,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <Header
        eyebrow="Private Sales OS"
        title="Overview"
        description="Single-operator autonomous outreach engine powered by Gemini AI and Gmail API."
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowImportCSV(true)}
            >
              <UploadCloud size={14} strokeWidth={1.75} />
              <span>Import CSV</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreateCampaign(true)}
            >
              <Plus size={14} strokeWidth={2} />
              <span>New Campaign</span>
            </button>
          </>
        }
      />

      {/* Gmail Connection Warning Banner */}
      {!account && (
        <div
          style={{
            padding: "14px 18px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--warning-soft)",
                color: "var(--warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={16} strokeWidth={2} />
            </div>
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: 650, color: "var(--text-primary)" }}>
                Connect Gmail Mailbox
              </h4>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Link your Google account via OAuth 2.0 to enable automatic sequence sending.
              </p>
            </div>
          </div>
          <Link href="/settings" className="btn btn-secondary btn-sm">
            <span>Connect</span>
            <ArrowRight size={13} strokeWidth={2} />
          </Link>
        </div>
      )}

      {/* 4 Metric Stats Grid */}
      <div className="stat-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-label">
                <span>{stat.label}</span>
                <Icon size={15} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Live Stream */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Left: Quick Launch & System Health */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>
              Quick Launch
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
              Standard operational shortcuts
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowImportCSV(true)}
              className="card-interactive"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                textAlign: "left",
              }}
            >
              <UploadCloud size={18} strokeWidth={1.75} style={{ color: "var(--text-primary)" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Import Prospects
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  Upload CSV list
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateCampaign(true)}
              className="card-interactive"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                textAlign: "left",
              }}
            >
              <Sparkles size={18} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  New Campaign
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  AI sequence builder
                </p>
              </div>
            </button>
          </div>

          {/* Engine Status Callout */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: globalSending ? "#10b981" : "#f59e0b",
                }}
              />
              <div>
                <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Dispatch Status: {globalSending ? "Active" : "Paused"}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  20 max / day · Africa/Lagos
                </p>
              </div>
            </div>
            <Link href="/settings" className="btn btn-outline btn-sm">
              Settings
            </Link>
          </div>
        </div>

        {/* Right: Live Prospect Stream */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)" }}>
                Active Prospect Stream
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                Target prospects and reply status
              </p>
            </div>
            <Link href="/contacts" className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }}>
              <span>View all</span>
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {contacts.length === 0 ? (
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", padding: "16px 0", textAlign: "center" }}>
                No prospects found. Import contacts to begin outreach.
              </p>
            ) : (
              contacts.slice(0, 4).map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "border-color 0.12s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                  >
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                        {contact.email} · {contact.company}
                      </p>
                    </div>

                    <StatusBadge status={contact.state} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSuccess={() => {
          setShowCreateCampaign(false);
          loadData();
        }}
      />

      <ImportCSVModal
        isOpen={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        onSuccess={() => {
          setShowImportCSV(false);
          loadData();
        }}
      />
    </div>
  );
}
