"use client";

import { useState } from "react";
import Card from "./Card";

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
  const [audience, setAudience] = useState("VP of Engineering & Tech Leaders");
  const [product, setProduct] = useState("B2B developer platform");
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
      bodyText: "Hi {{first_name}},\n\nI noticed {{company}} is growing its tech stack...",
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
          maxWidth: "750px",
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
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Create New Campaign</h3>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Set up a sequenced cold outreach campaign with step-by-step follow-ups
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
            <div>
              <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                Campaign Name *
              </label>
              <input
                type="text"
                className="input"
                style={{ width: "100%" }}
                placeholder="e.g. Q4 Fintech Founders Outreach"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                Description / Objective
              </label>
              <input
                type="text"
                className="input"
                style={{ width: "100%" }}
                placeholder="e.g. Outreach to mid-stage SaaS executives for our new API"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Daily Send Limit
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: "100%" }}
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                  Hourly Send Limit
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: "100%" }}
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                />
              </div>
            </div>

            {/* AI Sequence Generation Box */}
            <div style={{ background: "var(--bg-tertiary)", padding: "16px", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 650, color: "var(--accent)" }}>
                  ✨ Gemini AI Step Generator
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate 4 Steps with Gemini"}
                </button>
              </div>

              <div className="grid-2" style={{ marginBottom: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block" }}>Audience</label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%", fontSize: "12px" }}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block" }}>Product / Offer</label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%", fontSize: "12px" }}
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </div>
              </div>

              {/* Steps list */}
              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                {steps.map((s) => (
                  <div key={s.number} className="step-card" style={{ padding: "10px" }}>
                    <div className="step-number" style={{ width: "24px", height: "24px", fontSize: "12px" }}>
                      {s.number}
                    </div>
                    <div className="step-content">
                      <p className="step-subject" style={{ fontSize: "13px" }}>{s.subject}</p>
                      <p className="step-delay" style={{ fontSize: "11px" }}>{s.delayDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)" }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
