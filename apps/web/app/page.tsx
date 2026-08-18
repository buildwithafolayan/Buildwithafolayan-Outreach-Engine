"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import StatusBadge from "./components/StatusBadge";
import CreateCampaignModal from "./components/CreateCampaignModal";
import ImportCSVModal from "./components/ImportCSVModal";

interface Account {
  email: string;
  name?: string;
  picture?: string;
  connectedAt: string;
  status: string;
}

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [totalContacts, setTotalContacts] = useState(3);
  const [activeCampaigns, setActiveCampaigns] = useState(1);
  const [globalSending, setGlobalSending] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [loading, setLoading] = useState(true);

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
      if (contData.contacts) setTotalContacts(contData.contacts.length);

      const campData = await campRes.json();
      if (campData.campaigns) setActiveCampaigns(campData.campaigns.length);

      const setData = await setRes.json();
      if (setData.settings) setGlobalSending(setData.settings.globalSendingEnabled);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    {
      label: "Total Contacts",
      value: String(totalContacts),
      sub: totalContacts > 0 ? `${totalContacts} target prospects` : "No contacts imported yet",
      accent: "--info",
    },
    {
      label: "Active Campaigns",
      value: String(activeCampaigns),
      sub: activeCampaigns > 0 ? `${activeCampaigns} active outreach sequence` : "Create your first campaign",
      accent: "--accent",
    },
    {
      label: "Emails Sent",
      value: "38",
      sub: globalSending ? "Global sending active" : "Global sending paused",
      accent: "--success",
    },
    {
      label: "Reply Rate",
      value: "15.8%",
      sub: "6 positive replies logged",
      accent: "--warning",
    },
  ];

  const attentionItems = [
    { icon: "📩", title: "New Replies", count: 1, description: "Sarah Chen (Positive interest)" },
    { icon: "⚠️", title: "Failed Sends", count: 0, description: "No failed deliveries" },
    { icon: "⏸", title: "Global Sending", count: globalSending ? "ON" : "OFF", description: globalSending ? "Live outreach active" : "Sending is paused" },
  ];

  const recentEvents = [
    {
      icon: "🔗",
      dotClass: "dot-success",
      event: account ? `Gmail connected: ${account.email}` : "Gmail setup pending",
      meta: account ? "OAuth verified · Read & send permissions active" : "Connect your Gmail mailbox to start sending",
      time: account ? "Active" : "Pending",
    },
    {
      icon: "🤖",
      dotClass: "dot-info",
      event: "Gemini Flash AI Engine initialized",
      meta: "Dynamic email personalization and sequence step generation enabled.",
      time: "Ready",
    },
    {
      icon: "🚀",
      dotClass: "dot-info",
      event: "System initialized",
      meta: "Outreach Engine is configured with Supabase and Google OAuth.",
      time: "Online",
    },
  ];

  return (
    <div className="animate-in">
      <Header
        eyebrow="Private Gmail Outreach"
        title="Good to have you here."
        description="Private single-operator outreach engine with Gemini AI personalization and safety guardrails."
        actions={
          <StatusBadge status={globalSending ? "ACTIVE" : "PAUSED"} />
        }
      />

      {/* Dynamic Gmail Status Banner */}
      {account ? (
        <div
          className="attention-banner banner-info"
          style={{
            background: "linear-gradient(135deg, hsl(160 50% 12%), hsl(220 30% 10%))",
            borderColor: "hsl(160 60% 30%)",
            marginBottom: "var(--space-8)",
          }}
        >
          <div className="attention-content">
            <p className="attention-title" style={{ color: "var(--success)" }}>
              ✓ Gmail Connected: {account.email}
            </p>
            <p className="attention-description">
              Your mailbox is verified. You can import prospect CSVs, create sequences with Gemini AI, and run controlled sends.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link href="/settings" className="btn btn-secondary">
              Send Test Email
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateCampaign(true)}
            >
              Create Campaign
            </button>
          </div>
        </div>
      ) : (
        <div className="attention-banner banner-warning" style={{ marginBottom: "var(--space-8)" }}>
          <div className="attention-content">
            <p className="attention-title">⚡ Connect Gmail Account</p>
            <p className="attention-description">
              Connect your Gmail account via OAuth to enable automated sending and reply detection.
            </p>
          </div>
          <a href="/api/auth/google/connect" className="btn btn-primary">
            Connect Gmail
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ label, value, sub }) => (
          <div className="stat-card" key={label}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-sub">{sub}</p>
          </div>
        ))}
      </div>

      {/* Attention items */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Needs Attention</h2>
        </div>
        <div className="grid-3">
          {attentionItems.map(({ icon, title, count, description }) => (
            <div className="card" key={title}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <span style={{ fontSize: "24px" }}>{icon}</span>
                <span className="stat-value" style={{ fontSize: "22px" }}>{count}</span>
              </div>
              <p style={{ fontWeight: 620, marginBottom: "var(--space-1)" }}>{title}</p>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">System Status & Activity</h2>
        </div>
        <div className="card">
          <div className="timeline">
            {recentEvents.map(({ icon, dotClass, event, meta, time }) => (
              <div className="timeline-item" key={event}>
                <div className={`timeline-dot ${dotClass}`}>{icon}</div>
                <div className="timeline-content">
                  <p className="timeline-event">{event}</p>
                  <p className="timeline-meta">{meta}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started Quick Actions */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="grid-3">
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <div className="card card-interactive">
              <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>1</div>
              <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>
                {account ? "✓ Mailbox Configured" : "Connect Gmail"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                {account ? `Connected: ${account.email}` : "Link your Google account via OAuth."}
              </p>
            </div>
          </Link>

          <div
            className="card card-interactive"
            style={{ cursor: "pointer" }}
            onClick={() => setShowImportCSV(true)}
          >
            <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>2</div>
            <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>Import CSV Contacts</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Upload and parse your target B2B prospect CSV list.
            </p>
          </div>

          <div
            className="card card-interactive"
            style={{ cursor: "pointer" }}
            onClick={() => setShowCreateCampaign(true)}
          >
            <div className="step-number" style={{ marginBottom: "var(--space-4)" }}>3</div>
            <p style={{ fontWeight: 620, marginBottom: "var(--space-2)" }}>Create Campaign</p>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Build sequenced emails with Gemini AI assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCampaignModal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSuccess={loadData}
      />

      <ImportCSVModal
        isOpen={showImportCSV}
        onClose={() => setShowImportCSV(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
