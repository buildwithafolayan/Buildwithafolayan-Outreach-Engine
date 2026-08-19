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
    return <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Loading...</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "12.5px",
          color: enabled ? "#34d399" : "var(--text-tertiary)",
          fontWeight: 600,
        }}
      >
        {enabled ? "Active" : "Paused"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        style={{
          width: "38px",
          height: "22px",
          borderRadius: "9999px",
          backgroundColor: enabled ? "#10b981" : "var(--border-strong)",
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background-color 0.15s ease",
          padding: "2px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            transform: enabled ? "translateX(16px)" : "translateX(0px)",
            transition: "transform 0.15s ease",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
          }}
        />
      </button>
    </div>
  );
}
