"use client";

import { useState } from "react";
import { X, UserPlus, AlertCircle } from "lucide-react";

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Add Outreach Prospect
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Add a single B2B prospect to your directory
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: "4px" }}
          >
            <X size={14} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-xs)",
              fontSize: "12px",
              marginBottom: "16px",
              background: "var(--danger-soft)",
              color: "#f87171",
              border: "1px solid var(--danger-border)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={13} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                First Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Sarah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Last Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Chen"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Work Email *
              </label>
              <input
                type="email"
                className="input"
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Company Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="Acme SaaS"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Website
              </label>
              <input
                type="text"
                className="input"
                placeholder="acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Industry
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Fintech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Context & Background Notes
            </label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="e.g. VP of Product. Scaling automated workflows."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Prospect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
