"use client";

import { useState } from "react";
import Card from "./Card";

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
        className="btn btn-secondary"
        style={{
          borderColor: "hsl(270 60% 40%)",
          color: "hsl(270 80% 75%)",
        }}
        onClick={() => {
          setIsOpen(true);
          if (steps.length === 0) handleGenerate();
        }}
      >
        ✨ Generate Steps with Gemini
      </button>

      {isOpen && (
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
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              maxWidth: "800px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>✨</span>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                      AI Sequence Generator (Gemini Flash)
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      Craft high-converting 4-step sequence templates automatically
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="grid-2" style={{ marginBottom: "var(--space-4)" }}>
                <div>
                  <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                    Target Audience
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%" }}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                    Product / Core Offer
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ width: "100%" }}
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "var(--space-5)" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating with Gemini..." : "Generate 4-Step Sequence"}
                </button>
              </div>

              {isLoading && (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚡</div>
                  <p>Gemini Flash is drafting personalized B2B outreach sequences...</p>
                </div>
              )}

              {steps.length > 0 && !isLoading && (
                <div style={{ display: "grid", gap: "var(--space-3)" }}>
                  {steps.map((s) => (
                    <div key={s.stepNumber} className="step-card">
                      <div className="step-number">{s.stepNumber}</div>
                      <div className="step-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <p className="step-subject">{s.subjectTemplate}</p>
                          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{s.delayDescription}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "pre-line", marginBottom: "8px", background: "var(--bg-tertiary)", padding: "10px", borderRadius: "6px" }}>
                          {s.bodyTemplate}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--accent)" }}>
                          💡 Strategy: {s.rationale}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
