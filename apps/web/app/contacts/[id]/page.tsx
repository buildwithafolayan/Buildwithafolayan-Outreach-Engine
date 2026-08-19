"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Building,
  MapPin,
  Sparkles,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react";
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
      <div style={{ padding: "40px 0", color: "var(--text-muted)", fontSize: "13px" }}>
        Loading prospect profile...
      </div>
    );
  }

  if (!contact) {
    return (
      <div style={{ padding: "40px 0" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Prospect Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "13px" }}>
          The requested contact does not exist or has been removed.
        </p>
        <Link href="/contacts" className="btn btn-secondary">
          <ArrowLeft size={14} strokeWidth={2} />
          <span>Back to Contacts</span>
        </Link>
      </div>
    );
  }

  const currentContact = contact;

  const timeline = [
    {
      icon: Mail,
      event: currentContact.state === "REPLIED" ? "Positive reply received" : "Contact added to database",
      meta: currentContact.state === "REPLIED" ? "Sequence paused — manual review needed" : "Ready for sequence enrollment",
      time: currentContact.lastActivity || "Recently",
    },
    {
      icon: Sparkles,
      event: "AI Pitch Ready",
      meta: "Contextual hook and value proposition ready for generation.",
      time: "Active",
    },
    {
      icon: FileText,
      event: `Imported via ${currentContact.source || "Manual Entry"}`,
      meta: `Email verified: ${currentContact.email}`,
      time: "Initial",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Breadcrumb */}
      <div className="page-eyebrow">
        <Link href="/contacts" style={{ color: "var(--text-tertiary)" }}>
          Contacts
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>
          {currentContact.firstName} {currentContact.lastName}
        </span>
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

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            className="select"
            style={{ width: "auto", fontSize: "12.5px" }}
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
            <Sparkles size={14} strokeWidth={2} />
            <span>AI Personalize</span>
          </a>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left Column: Contact Profile & Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "14px" }}>
              Prospect Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Email</span>
                <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {currentContact.email}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Company</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{currentContact.company}</span>
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

          <div className="card">
            <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "8px" }}>
              Context & Background Notes
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {currentContact.notes || "No additional notes provided for this prospect."}
            </p>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="card">
          <h3 style={{ fontSize: "14px", fontWeight: 650, color: "var(--text-primary)", marginBottom: "14px" }}>
            Outreach History
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {timeline.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "var(--radius-xs)",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-secondary)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.event}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "1px" }}>
                      {item.meta}
                    </p>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {item.time}
                  </span>
                </div>
              );
            })}
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
