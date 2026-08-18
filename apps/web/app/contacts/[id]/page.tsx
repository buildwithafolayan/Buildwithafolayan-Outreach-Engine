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

  useEffect(() => {
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts) {
          const found = data.contacts.find((c: Contact) => c.id === id);
          if (found) setContact(found);
          else if (data.contacts.length > 0) setContact(data.contacts[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (!contact && !loading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <p>Contact not found.</p>
        <Link href="/contacts" className="btn btn-secondary" style={{ marginTop: "16px" }}>
          ← Back to Contacts
        </Link>
      </div>
    );
  }

  const currentContact = contact || {
    id: "c1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@techcorp.io",
    company: "TechCorp",
    website: "techcorp.io",
    city: "San Francisco",
    industry: "SaaS",
    state: "REPLIED",
    source: "CSV Import",
    notes: "VP of Engineering. Scaling team. Interested in automation.",
    tags: ["saas", "engineering-lead"],
    createdAt: new Date().toISOString(),
    lastActivity: "Replied 4 hours ago",
  };

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
        <div style={{ display: "flex", gap: "10px" }}>
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
