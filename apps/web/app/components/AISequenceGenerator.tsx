"use client";

import { useState } from "react";
import { Sparkles, X, RefreshCw, Lightbulb } from "lucide-react";

interface AISequenceGeneratorProps {
  campaignName: string;
  onApplySteps?: (steps: Array<{ stepNumber: number; subjectTemplate: string; bodyTemplate: string; delayDescription: string }>) => void;
}

export default function AISequenceGenerator({
  campaignName,
}: AISequenceGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState("VPs of Engineering and CTOs at scale-up tech companies");
  const [product, setProduct] = useState("Developer productivity platform that cuts build and test CI pipeline latency by 40%");
  const [steps, setSteps] = useState<Array<{
    stepNumber: number;
    delayDays: number;
    delayDescription: string;
    subjectTemplate: string;
    bodyTemplate: string;
    rationale: string;
  }>>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/generate-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          targetAudience: audience,
          productDescription: product,
          numSteps: 4,
        }),
      });
      const data = await res.json();
      if (res.ok && data.steps) {
        setSteps(data.steps);
      } else {
        alert(data.error || "Failed to generate sequence");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting Gemini AI");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setIsOpen(true);
          if (steps.length === 0) handleGenerate();
        }}
      >
        <Sparkles size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
        <span>Generate Steps with AI</span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    AI Sequence Generator
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    Generate full 4-step sequence cadences using Gemini Flash
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsOpen(false)}
                style={{ padding: "4px" }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Target Audience
                </label>
                <input
                  type="text"
                  className="input"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Product / Core Offer
                </label>
                <input
                  type="text"
                  className="input"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <RefreshCw size={12} strokeWidth={2} className={isLoading ? "animate-spin" : ""} />
                <span>{isLoading ? "Generating..." : "Generate 4-Step Cadence"}</span>
              </button>
            </div>

            {isLoading && (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "12.5px" }}>
                <p>Gemini AI is drafting cold outreach copy and strategic sequence timing...</p>
              </div>
            )}

            {steps.length > 0 && !isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {steps.map((s) => (
                  <div
                    key={s.stepNumber}
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                          Step {s.stepNumber}:
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {s.subjectTemplate}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                        {s.delayDescription}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                        whiteSpace: "pre-line",
                        backgroundColor: "var(--bg-surface)",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-subtle)",
                        marginBottom: "6px",
                      }}
                    >
                      {s.bodyTemplate}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-tertiary)" }}>
                      <Lightbulb size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
                      <span>Strategy: {s.rationale}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
