"use client";

import { useEffect, useState } from "react";

interface GlobalSendingSwitchProps {
  onToggle?: (enabled: boolean) => void;
}

export default function GlobalSendingSwitch({ onToggle }: GlobalSendingSwitchProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setEnabled(data.settings.globalSendingEnabled);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    if (onToggle) onToggle(nextState);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalSendingEnabled: nextState }),
      });
    } catch (e) {
      console.error("Failed to update global sending state:", e);
    }
  };

  if (loading) {
    return <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>Loading...</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
      <span
        style={{
          fontSize: "13px",
          color: enabled ? "var(--success)" : "var(--warning)",
          fontWeight: 600,
        }}
      >
        {enabled ? "Active (Sending Enabled)" : "Paused"}
      </span>
      <button
        className={`toggle${enabled ? " active" : ""}`}
        onClick={handleToggle}
        aria-label="Toggle global sending"
        style={{
          background: enabled ? "var(--success)" : "var(--border-default)",
        }}
      >
        <span
          style={{
            transform: enabled ? "translateX(20px)" : "translateX(2px)",
          }}
        />
      </button>
    </div>
  );
}
