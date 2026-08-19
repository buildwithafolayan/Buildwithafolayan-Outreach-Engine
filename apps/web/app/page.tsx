"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import CreateCampaignModal from "./components/CreateCampaignModal";
import ImportCSVModal from "./components/ImportCSVModal";

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
  const replyRateStr = totalSent > 0 ? `${((totalReplied / totalSent) * 100).toFixed(1)}%` : "0.0%";

  const stats = [
    {
      label: "Total Prospects",
      value: String(totalContacts),
      sub: totalContacts > 0 ? `${totalContacts} active B2B targets` : "Import prospect targets",
      badge: "+100%",
      badgeColor: "rgba(16, 185, 129, 0.16)",
      textColor: "#34d399",
      icon: "◉",
      gradient: "linear-gradient(135deg, #007aff, #5856d6)",
    },
    {
      label: "Active Campaigns",
      value: String(activeCampaigns),
      sub: activeCampaigns > 0 ? `${activeCampaigns} outreach sequences` : "Create campaign",
      badge: activeCampaigns > 0 ? "Active" : "Idle",
      badgeColor: "rgba(175, 82, 222, 0.16)",
      textColor: "#c084fc",
      icon: "◈",
      gradient: "linear-gradient(135deg, #af52de, #7c3aed)",
    },
    {
      label: "Dispatched Emails",
      value: String(totalSent),
      sub: globalSending ? "Outreach window open" : "Sending paused",
      badge: totalSent > 0 ? "Inbox Live" : "Ready",
      badgeColor: "rgba(0, 199, 190, 0.16)",
      textColor: "#2dd4bf",
      icon: "✉",
      gradient: "linear-gradient(135deg, #00c7be, #0284c7)",
    },
    {
      label: "Positive Reply Rate",
      value: replyRateStr,
      sub: `${totalReplied} responses recorded`,
      badge: totalReplied > 0 ? "Replies Detected" : "Awaiting Replies",
      badgeColor: "rgba(245, 158, 11, 0.16)",
      textColor: "#fbbf24",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #ff9500, #ea580c)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Apple Header */}
      <Header
        eyebrow="Private Sales Operating System"
        title="Good to have you here, Favour."
        description="Private single-operator outreach infrastructure powered by Gemini AI with Apple Intelligence speed."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowImportCSV(true)}
            >
              <span>📄</span>
              <span>Import CSV</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateCampaign(true)}
            >
              <span>+</span>
              <span>New Campaign</span>
            </button>
          </div>
        }
      />

      {/* Gmail Setup Banner (if not connected) */}
      {!account && (
        <div
          className="ios-glass"
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.03))",
            borderColor: "rgba(245, 158, 11, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ff9500, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: "#ffffff",
                boxShadow: "0 6px 16px rgba(245, 158, 11, 0.35)",
              }}
            >
              ⚡
            </div>
            <div>
              <h4 style={{ fontSize: "14.5px", fontWeight: 700, color: "#ffffff" }}>
                Connect Primary Gmail Mailbox
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Authenticate your Google account via OAuth 2.0 to enable automatic sequence sending.
              </p>
            </div>
          </div>
          <Link href="/settings" className="btn btn-primary btn-sm" style={{ padding: "8px 16px" }}>
            Connect Mailbox →
          </Link>
        </div>
      )}

      {/* Apple Modular 4-Widget Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="ios-card-interactive">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: stat.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "100px",
                  background: stat.badgeColor,
                  color: stat.textColor,
                  letterSpacing: "0.02em",
                }}
              >
                {stat.badge}
              </span>
            </div>

            <div style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: "4px" }}>
              {stat.value}
            </div>

            <p style={{ fontSize: "13px", fontWeight: 650, color: "var(--text-primary)" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Two Column Section: Pipeline Velocity & Hot Opportunities */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "24px",
        }}
      >
        {/* Left: Quick Actions & Live Engine Status */}
        <div className="ios-glass" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 750 }}>Pipeline Quick Actions</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-tertiary)" }}>
                Apple Shortcuts style rapid outreach triggers
              </p>
            </div>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "100px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--text-secondary)",
              }}
            >
              Shortcuts
            </span>
          </div>

          {/* Quick Action Tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            <button
              onClick={() => setShowImportCSV(true)}
              className="ios-glass"
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "20px" }}>📥</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                Import Prospects
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                Upload CSV target list
              </span>
            </button>

            <button
              onClick={() => setShowCreateCampaign(true)}
              className="ios-glass"
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "20px" }}>✦</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                AI Sequence
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                Generate with Gemini AI
              </span>
            </button>
          </div>

          {/* System Health Summary */}
          <div
            style={{
              padding: "16px",
              background: "rgba(0, 0, 0, 0.25)",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: globalSending ? "var(--success)" : "var(--warning)",
                  boxShadow: `0 0 10px ${globalSending ? "var(--success)" : "var(--warning)"}`,
                }}
              />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 650, color: "#ffffff" }}>
                  Global Sending Switch: {globalSending ? "Enabled" : "Paused"}
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                  Daily dispatch limit: 20 · Timezone: Africa/Lagos
                </p>
              </div>
            </div>
            <Link href="/settings" className="btn btn-secondary btn-sm">
              Configure
            </Link>
          </div>
        </div>

        {/* Right: Hot Leads & Opportunity Stream */}
        <div className="ios-glass" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 750 }}>Hot Lead Stream</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-tertiary)" }}>
                Prospects with active sequences or detected replies
              </p>
            </div>
            <span
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "100px",
                background: "rgba(16, 185, 129, 0.16)",
                color: "#34d399",
                fontWeight: 650,
              }}
            >
              {contacts.filter((c) => c.state === "REPLIED" || c.state === "ENROLLED").length} Active
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {contacts.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)", padding: "12px 0" }}>
                No target prospects found. Import contacts to populate live stream.
              </p>
            ) : (
              (contacts.filter((c) => c.state === "REPLIED" || c.state === "ENROLLED").length > 0
                ? contacts.filter((c) => c.state === "REPLIED" || c.state === "ENROLLED")
                : contacts.slice(0, 3)
              ).map((contact, idx) => {
                const initials =
                  `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase() || "P";
                const isReplied = contact.state === "REPLIED";
                const isEnrolled = contact.state === "ENROLLED";

                return (
                  <Link
                    key={contact.id || idx}
                    href={`/contacts/${contact.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        background: isReplied
                          ? "rgba(16, 185, 129, 0.06)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: isReplied
                          ? "1px solid rgba(16, 185, 129, 0.25)"
                          : "1px solid var(--border-subtle)",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: isReplied
                              ? "linear-gradient(135deg, #10b981, #059669)"
                              : isEnrolled
                              ? "linear-gradient(135deg, #af52de, #7c3aed)"
                              : "linear-gradient(135deg, #007aff, #5856d6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 750,
                            fontSize: "13px",
                            color: "#ffffff",
                            boxShadow: isReplied
                              ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                              : "none",
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                            {contact.email} · {contact.company}
                          </p>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 650,
                          padding: "4px 8px",
                          borderRadius: "100px",
                          background: isReplied
                            ? "rgba(16, 185, 129, 0.2)"
                            : isEnrolled
                            ? "rgba(175, 82, 222, 0.16)"
                            : "rgba(255, 255, 255, 0.08)",
                          color: isReplied ? "#34d399" : isEnrolled ? "#c084fc" : "var(--text-secondary)",
                        }}
                      >
                        {contact.state}
                      </span>
                    </div>
                  </Link>
                );
              })
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
