"use client";

import { useState } from "react";
import Card from "./Card";

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
        className="btn btn-primary"
        style={{
          background: "linear-gradient(135deg, hsl(270 85% 65%), var(--accent))",
        }}
        onClick={() => {
          setIsOpen(true);
          if (!result) handleGenerate();
        }}
      >
        ✨ AI Personalize Preview (Gemini)
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
              maxWidth: "680px",
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
                      Gemini Flash Personalization
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      Personalizing copy specifically for {contact.firstName} {contact.lastName} at {contact.company}
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

              <div style={{ marginBottom: "var(--space-4)" }}>
                <label className="input-label" style={{ marginBottom: "6px", display: "block" }}>
                  Value Proposition / Hook Focus
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-5)" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating with Gemini..." : "Regenerate Copy"}
                </button>
              </div>

              {isLoading && (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-tertiary)" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
                  <p>Gemini Flash is analyzing {contact.company} and crafting tailored outreach copy...</p>
                </div>
              )}

              {result && !isLoading && (
                <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
                  <div style={{ background: "var(--bg-tertiary)", padding: "14px", borderRadius: "8px" }}>
                    <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--accent)", fontWeight: 700, marginBottom: "4px" }}>
                      Custom Hook & Reasoning
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      💡 {result.customHook}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                      {result.reasoning}
                    </p>
                  </div>

                  <div>
                    <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: "100%", fontWeight: 600 }}
                      value={result.personalizedSubject}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="input-label" style={{ marginBottom: "4px", display: "block" }}>
                      Personalized Body (Plain Text)
                    </label>
                    <textarea
                      className="input textarea"
                      style={{ width: "100%", height: "180px", fontFamily: "var(--font-sans)", lineHeight: 1.6 }}
                      value={result.personalizedBody}
                      readOnly
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
