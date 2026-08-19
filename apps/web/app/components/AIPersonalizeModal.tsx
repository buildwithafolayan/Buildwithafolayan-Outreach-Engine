"use client";

import { useState } from "react";
import { Sparkles, X, RefreshCw, Lightbulb } from "lucide-react";

interface AIPersonalizeModalProps {
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    industry?: string;
    notes?: string;
  };
  initialSubject: string;
  initialBody: string;
}

export default function AIPersonalizeModal({
  contact,
  initialSubject,
  initialBody,
}: AIPersonalizeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [valueProp, setValueProp] = useState(
    "Automate personalized sales outreach and never get stuck in spam with authentic plain-text sequence automation."
  );
  const [result, setResult] = useState<{
    personalizedSubject: string;
    personalizedBody: string;
    customHook: string;
    reasoning: string;
  } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          templateSubject: initialSubject,
          templateBody: initialBody,
          valueProposition: valueProp,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Failed to generate personalization");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting Gemini AI service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          setIsOpen(true);
          if (!result) handleGenerate();
        }}
      >
        <Sparkles size={14} strokeWidth={2} />
        <span>AI Personalize Preview</span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
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
                    Gemini AI Personalization
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    Tailored copy for {contact.firstName} {contact.lastName} ({contact.company})
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

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Value Proposition / Hook Focus
              </label>
              <input
                type="text"
                className="input"
                value={valueProp}
                onChange={(e) => setValueProp(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <RefreshCw size={12} strokeWidth={2} className={isLoading ? "animate-spin" : ""} />
                <span>{isLoading ? "Generating..." : "Regenerate Pitch"}</span>
              </button>
            </div>

            {isLoading && (
              <div style={{ padding: "28px", textAlign: "center", color: "var(--text-muted)", fontSize: "12.5px" }}>
                <p>Gemini AI is analyzing {contact.company} and generating bespoke copy...</p>
              </div>
            )}

            {result && !isLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <Lightbulb size={13} strokeWidth={2} style={{ color: "var(--warning)" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      Custom Hook & Reasoning
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {result.customHook}
                  </p>
                  <p style={{ fontSize: "11.5px", color: "var(--text-tertiary)" }}>
                    {result.reasoning}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Personalized Subject
                  </label>
                  <input
                    type="text"
                    className="input"
                    style={{ fontWeight: 600 }}
                    value={result.personalizedSubject}
                    readOnly
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Personalized Body (Plain Text)
                  </label>
                  <textarea
                    className="textarea"
                    rows={6}
                    style={{ fontFamily: "var(--font-sans)", lineHeight: 1.5, fontSize: "12.5px" }}
                    value={result.personalizedBody}
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
