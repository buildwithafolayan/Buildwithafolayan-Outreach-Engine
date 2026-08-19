"use client";

import { useState } from "react";
import { Sparkles, X, Send, Clock } from "lucide-react";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyLimit, setDailyLimit] = useState(20);
  const [hourlyLimit, setHourlyLimit] = useState(5);
  const [audience, setAudience] = useState("Tech Founders & VP Engineering");
  const [product, setProduct] = useState("B2B Developer Infrastructure");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState<Array<{
    number: number;
    subject: string;
    bodyText: string;
    delayDays: number;
    delayDescription: string;
  }>>([
    {
      number: 1,
      subject: "Helping {{company}} scale faster",
      bodyText: "Hi {{first_name}},\n\nI noticed {{company}} is scaling engineering...",
      delayDays: 0,
      delayDescription: "Immediate",
    },
  ]);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!name) {
      alert("Please enter a campaign name first.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: name,
          targetAudience: audience,
          productDescription: product,
          numSteps: 4,
        }),
      });
      const data = await res.json();
      if (res.ok && data.steps) {
        setSteps(
          data.steps.map((s: { stepNumber: number; subjectTemplate: string; bodyTemplate: string; delayDays: number; delayDescription: string }) => ({
            number: s.stepNumber,
            subject: s.subjectTemplate,
            bodyText: s.bodyTemplate,
            delayDays: s.delayDays,
            delayDescription: s.delayDescription,
          }))
        );
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate sequence with AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          dailyLimit,
          hourlyLimit,
          steps,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setName("");
        setDescription("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create campaign");
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
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
              Create Campaign Sequence
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Configure multi-step email cadences with AI copywriting
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Campaign Name *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Q4 Executive Outreach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Objective / Notes
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Outreach to early-stage CTOs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Daily Send Limit
              </label>
              <input
                type="number"
                className="input"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Hourly Send Limit
              </label>
              <input
                type="number"
                className="input"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
              />
            </div>
          </div>

          {/* AI Generator Box */}
          <div
            style={{
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
                <span style={{ fontSize: "12.5px", fontWeight: 650, color: "var(--text-primary)" }}>
                  Gemini AI Sequence Generator
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGenerateAI}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate 4 Steps"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: "2px" }}>Target Audience</label>
                <input
                  type="text"
                  className="input"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: "2px" }}>Product / Offer</label>
                <input
                  type="text"
                  className="input"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
              </div>
            </div>

            {/* Generated Steps Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {steps.map((s) => (
                <div
                  key={s.number}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "var(--radius-xs)",
                      backgroundColor: "var(--bg-surface-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {s.number}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.subject}
                    </p>
                  </div>
                  <span style={{ fontSize: "10.5px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {s.delayDescription}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
