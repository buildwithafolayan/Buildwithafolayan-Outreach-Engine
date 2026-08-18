"use client";

import { useState } from "react";
import Card from "./Card";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({ isOpen, onClose, onSuccess }: AddContactModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !company) {
      setError("First Name, Email, and Company are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          company,
          website,
          industry,
          notes,
          tags: ["manual"],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
        // Reset form
        setFirstName("");
        setLastName("");
        setEmail("");
        setCompany("");
        setWebsite("");
        setIndustry("");
        setNotes("");
      } else {
        setError(data.error || "Failed to add contact.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error adding contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card glass>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Add Outreach Contact</h3>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Add an individual B2B prospect to your outreach list
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                marginBottom: "var(--space-4)",
                background: "var(--danger-soft)",
                color: "var(--danger)",
              }}
            >
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
            <div className="grid-2">
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  First Name *
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Last Name
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g. Mercer"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g. Acme SaaS"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Website
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Industry
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  placeholder="e.g. Developer Tools, Fintech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                Notes / Personalization Context
              </label>
              <textarea
                className="input textarea"
                style={{ width: "100%", height: "80px" }}
                placeholder="e.g. VP of Product. Recently raised Series B. Interested in automation."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
