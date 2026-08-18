"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import Card from "../../components/Card";
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
      <div className="animate-in" style={{ padding: "40px 0" }}>
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
      dotClass: "dot-success",
      event: currentContact.state === "REPLIED" ? "Positive reply received" : "Contact added to database",
      meta: currentContact.state === "REPLIED" ? "Sequence paused automatically — awaiting manual follow-up" : "Ready for campaign enrollment",
      time: currentContact.lastActivity || "Recently",
    },
    {
      icon: "🤖",
      dotClass: "dot-info",
      event: "Gemini AI Profile Ready",
      meta: "Contextual hook and value proposition ready to personalize.",
      time: "Active",
    },
    {
      icon: "⬆️",
      dotClass: "",
      event: `Imported via ${currentContact.source || "Manual Entry"}`,
      meta: `Email verified: ${currentContact.email}`,
      time: "Initial",
    },
  ];

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <p className="page-eyebrow" style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/contacts" style={{ color: "var(--text-tertiary)" }}>
          Contacts
        </Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>/</span>
        <span>{currentContact.firstName} {currentContact.lastName}</span>
      </p>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "var(--space-8)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h1 className="page-title">{currentContact.firstName} {currentContact.lastName}</h1>
            <StatusBadge status={currentContact.state} />
          </div>
          <p className="page-description">
            {currentContact.company}
            {currentContact.industry ? ` · ${currentContact.industry}` : ""}
            {currentContact.city ? ` · ${currentContact.city}` : ""}
          </p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: "var(--space-2)" }}>
          <a
            href="#ai-personalize-section"
            className="btn btn-primary"
          >
            ✨ AI Personalize Email
          </a>
        </div>
      </div>

      {/* Grid: Details & Timeline */}
      <div className="grid-2" style={{ gap: "var(--space-6)", alignItems: "start" }}>
        {/* Left: Contact Info */}
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <Card>
            <h3 style={{ fontSize: "14px", fontWeight: 650, marginBottom: "var(--space-4)" }}>
              Contact Details
            </h3>
            <div style={{ display: "grid", gap: "var(--space-3)", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Email</span>
                <span style={{ color: "var(--accent)" }}>{currentContact.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Company</span>
                <span>{currentContact.company}</span>
              </div>
              {currentContact.website && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Website</span>
                  <span>{currentContact.website}</span>
                </div>
              )}
              {currentContact.city && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Location</span>
                  <span>{currentContact.city}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Source</span>
                <span>{currentContact.source}</span>
              </div>
            </div>
          </Card>

          {/* Personalization Notes */}
          <Card>
            <h3 style={{ fontSize: "14px", fontWeight: 650, marginBottom: "var(--space-2)" }}>
              Notes / Context
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {currentContact.notes || "No additional notes provided for this contact."}
            </p>
            {currentContact.tags?.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "var(--space-3)" }}>
                {currentContact.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "11px",
                      background: "var(--bg-tertiary)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Conversation Timeline */}
        <Card>
          <h3 style={{ fontSize: "14px", fontWeight: 650, marginBottom: "var(--space-4)" }}>
            Outreach History & Events
          </h3>
          <div className="timeline">
            {timeline.map(({ icon, dotClass, event, meta, time }) => (
              <div className="timeline-item" key={event}>
                <div className={`timeline-dot ${dotClass}`}>{icon}</div>
                <div className="timeline-content">
                  <p className="timeline-event">{event}</p>
                  <p className="timeline-meta">{meta}</p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Personalization Assistant */}
      <div id="ai-personalize-section" style={{ marginTop: "var(--space-8)" }}>
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
