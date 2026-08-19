"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import AIPersonalizeModal from "@/app/components/AIPersonalizeModal";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website?: string;
  city?: string;
  industry?: string;
  state: string;
  source: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  lastActivity?: string;
}

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingState, setUpdatingState] = useState(false);

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contacts/${id}`);
      const data = await res.json();
      if (res.ok && data.contact) {
        setContact(data.contact);
      } else {
        setContact(null);
      }
    } catch (e) {
      console.error("Failed to load contact:", e);
      setContact(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id]);

  const handleStateChange = async (newState: string) => {
    if (!contact) return;
    setUpdatingState(true);
    const oldState = contact.state;
    setContact({ ...contact, state: newState });

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: newState }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Failed to update contact status:", data.error);
        setContact((prev) => (prev ? { ...prev, state: oldState } : null));
      }
    } catch (err) {
      console.error("Error updating contact status:", err);
      setContact((prev) => (prev ? { ...prev, state: oldState } : null));
    } finally {
      setUpdatingState(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-secondary)" }}>
        <p>Loading contact details...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div style={{ padding: "40px 0" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Prospect Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          The requested contact does not exist or has been removed.
        </p>
        <Link href="/contacts" className="btn btn-secondary">
          ← Back to Contacts
        </Link>
      </div>
    );
  }

  const currentContact = contact;

  const timeline = [
    {
      icon: "📩",
      event: currentContact.state === "REPLIED" ? "Positive reply received" : "Contact added to database",
      meta: currentContact.state === "REPLIED" ? "Sequence paused automatically — awaiting manual follow-up" : "Ready for campaign enrollment",
      time: currentContact.lastActivity || "Recently",
      badgeColor: "rgba(16, 185, 129, 0.2)",
    },
    {
      icon: "✦",
      event: "Gemini AI Profile Ready",
      meta: "Contextual hook and value proposition ready to personalize.",
      time: "Active",
      badgeColor: "rgba(99, 102, 241, 0.2)",
    },
    {
      icon: "📄",
      event: `Imported via ${currentContact.source || "CSV Import"}`,
      meta: `Email verified: ${currentContact.email}`,
      time: "Initial",
      badgeColor: "rgba(255, 255, 255, 0.1)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Breadcrumb */}
      <div className="page-eyebrow">
        <Link href="/contacts" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>
          Contacts
        </Link>
        <span style={{ color: "var(--text-tertiary)" }}>/</span>
        <span style={{ color: "#ffffff" }}>
          {currentContact.firstName} {currentContact.lastName}
        </span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 className="page-title">
              {currentContact.firstName} {currentContact.lastName}
            </h1>
            <StatusBadge status={currentContact.state} />
          </div>
          <p className="page-description">
            {currentContact.company}
            {currentContact.industry ? ` · ${currentContact.industry}` : ""}
            {currentContact.city ? ` · ${currentContact.city}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            className="input"
            style={{ padding: "7px 12px", fontSize: "12.5px", width: "auto" }}
            value={currentContact.state}
            disabled={updatingState}
            onChange={(e) => handleStateChange(e.target.value)}
          >
            <option value="READY">Status: READY</option>
            <option value="ENROLLED">Status: ENROLLED</option>
            <option value="REPLIED">Status: REPLIED</option>
            <option value="COMPLETED">Status: COMPLETED</option>
          </select>
          <a href="#ai-personalize-section" className="btn btn-primary">
            ✦ AI Personalize Email
          </a>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Contact info & context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="ios-glass" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 750, color: "#ffffff", marginBottom: "16px" }}>
              Prospect Profile
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Email</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>{currentContact.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Company</span>
                <span style={{ color: "#ffffff", fontWeight: 600 }}>{currentContact.company}</span>
              </div>
              {currentContact.city && (
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Location</span>
                  <span>{currentContact.city}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Lead Source</span>
                <span>{currentContact.source}</span>
              </div>
            </div>
          </div>

          <div className="ios-glass" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 750, color: "#ffffff", marginBottom: "10px" }}>
              Context & Background Notes
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {currentContact.notes || "No additional notes provided for this prospect."}
            </p>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="ios-glass" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 750, color: "#ffffff", marginBottom: "16px" }}>
            Outreach History & Sequence Activity
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {timeline.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "12px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: item.badgeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                    {item.event}
                  </p>
                  <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                    {item.meta}
                  </p>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Personalization Assistant */}
      <div id="ai-personalize-section">
        <AIPersonalizeModal
          contact={{
            firstName: currentContact.firstName,
            lastName: currentContact.lastName,
            company: currentContact.company,
            industry: currentContact.industry,
            notes: currentContact.notes,
          }}
          initialSubject={`Helping ${currentContact.company} scale faster`}
          initialBody={`Hi ${currentContact.firstName},\n\nI noticed ${currentContact.company} is growing...`}
        />
      </div>
    </div>
  );
}
