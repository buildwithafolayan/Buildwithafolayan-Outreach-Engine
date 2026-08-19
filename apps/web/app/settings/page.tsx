"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import GmailConnectSection from "../components/GmailConnectSection";
import GlobalSendingSwitch from "../components/GlobalSendingSwitch";

interface SystemSettings {
  globalSendingEnabled: boolean;
  testRecipient?: string;
  dailyLimit: number;
  hourlyLimit: number;
  failureThreshold: number;
  timeZone: string;
  sendWindowStart: string;
  sendWindowEnd: string;
  activeDays: string[];
  randomizedDelayMinutes: number;
  emailSignature?: string;
  adminEmail: string;
}

const timezones = [
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT, UTC+1)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "UTC", label: "UTC" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    globalSendingEnabled: false,
    testRecipient: "",
    dailyLimit: 20,
    hourlyLimit: 5,
    failureThreshold: 3,
    timeZone: "Africa/Lagos",
    sendWindowStart: "09:00",
    sendWindowEnd: "17:00",
    activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    randomizedDelayMinutes: 15,
    emailSignature: "",
    adminEmail: "you@example.com",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSettings(data.settings);
        setSaveMessage({ type: "success", text: "Settings saved successfully." });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveMessage({ type: "error", text: "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!confirm("EMERGENCY STOP: This will immediately disable global sending and pause all outreach. Continue?")) {
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalSendingEnabled: false }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, globalSendingEnabled: false }));
        alert("Emergency Stop activated. Global sending is now HALTED.");
      }
    } catch (err) {
      console.error("Emergency stop failed:", err);
    }
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <Header
        eyebrow="Settings"
        title="Configuration"
        description="Manage global sending controls, rate limits, working hours, and your Gmail connection."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave()}
            disabled={saving || loading}
          >
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        }
      />

      {saveMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            background: saveMessage.type === "success" ? "var(--success-soft)" : "var(--danger-soft)",
            color: saveMessage.type === "success" ? "var(--success)" : "var(--danger)",
            fontWeight: 600,
          }}
        >
          {saveMessage.type === "success" ? "✓ " : "✕ "}
          {saveMessage.text}
        </div>
      )}

      {/* Global Sending Control */}
      <div className="settings-section">
        <h2 className="settings-section-title">Global Sending Control</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Global Sending Master Switch</p>
            <p className="settings-row-description">
              Master control for all automated sends across every campaign. When toggled off, all email dispatch is safely halted.
            </p>
          </div>
          <GlobalSendingSwitch />
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Safety Window & Guardrails</p>
            <p className="settings-row-description">
              Sends will only occur within working hours and are randomized to protect mailbox reputation.
            </p>
          </div>
          <span className="badge badge-success"><span className="badge-dot" />Guardrails Active</span>
        </div>
      </div>

      {/* Gmail OAuth Connection & Verification */}
      <GmailConnectSection />

      {/* Rate Limits */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div className="settings-section">
          <h2 className="settings-section-title">Rate Limits</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Daily Send Limit</p>
              <p className="settings-row-description">Maximum emails sent per calendar day across all campaigns.</p>
            </div>
            <input
              type="number"
              min={1}
              max={500}
              className="input"
              style={{ width: "90px", textAlign: "right" }}
              value={settings.dailyLimit}
              onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) || 20 })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Hourly Send Limit</p>
              <p className="settings-row-description">Maximum emails sent per hour to stay within Gmail guidelines.</p>
            </div>
            <input
              type="number"
              min={1}
              max={50}
              className="input"
              style={{ width: "90px", textAlign: "right" }}
              value={settings.hourlyLimit}
              onChange={(e) => setSettings({ ...settings, hourlyLimit: parseInt(e.target.value) || 5 })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Campaign Failure Threshold</p>
              <p className="settings-row-description">Auto-pause a campaign after this many consecutive send failures.</p>
            </div>
            <input
              type="number"
              min={1}
              max={20}
              className="input"
              style={{ width: "90px", textAlign: "right" }}
              value={settings.failureThreshold}
              onChange={(e) => setSettings({ ...settings, failureThreshold: parseInt(e.target.value) || 3 })}
            />
          </div>
        </div>

        {/* Working Hours */}
        <div className="settings-section">
          <h2 className="settings-section-title">Working Hours & Scheduling</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Time Zone</p>
              <p className="settings-row-description">All scheduling and working-hour calculations use this time zone.</p>
            </div>
            <select
              className="input"
              style={{ width: "auto", minWidth: "220px" }}
              value={settings.timeZone}
              onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Send Window Hours</p>
              <p className="settings-row-description">Emails are only sent between these hours. Sends outside this window are rescheduled.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="time"
                className="input"
                style={{ width: "auto" }}
                value={settings.sendWindowStart}
                onChange={(e) => setSettings({ ...settings, sendWindowStart: e.target.value })}
              />
              <span style={{ color: "var(--text-tertiary)" }}>to</span>
              <input
                type="time"
                className="input"
                style={{ width: "auto" }}
                value={settings.sendWindowEnd}
                onChange={(e) => setSettings({ ...settings, sendWindowEnd: e.target.value })}
              />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Randomized Delay (Jitter)</p>
              <p className="settings-row-description">Random jitter (minutes) added between sends to appear natural.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                min={0}
                max={60}
                className="input"
                style={{ width: "90px", textAlign: "right" }}
                value={settings.randomizedDelayMinutes}
                onChange={(e) => setSettings({ ...settings, randomizedDelayMinutes: parseInt(e.target.value) || 15 })}
              />
              <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>mins</span>
            </div>
          </div>
        </div>

        {/* AI Engine */}
        <div className="settings-section">
          <h2 className="settings-section-title">Gemini AI Engine</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Active AI Model</p>
              <p className="settings-row-description">Used for real-time personalization, sequence drafting, and reply sentiment classification.</p>
            </div>
            <span className="settings-row-value" style={{ color: "var(--accent)", fontWeight: 650 }}>gemini-2.0-flash (Gemini Flash)</span>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">API Status</p>
              <p className="settings-row-description">API Key configured in environment.</p>
            </div>
            <span className="badge badge-success"><span className="badge-dot" />Connected & Active</span>
          </div>
        </div>

        {/* Sender Identity */}
        <div className="settings-section">
          <h2 className="settings-section-title">Sender Identity</h2>
          <div className="settings-row" style={{ alignItems: "flex-start" }}>
            <div className="settings-row-info">
              <p className="settings-row-label">Email Signature</p>
              <p className="settings-row-description">Appended to every outbound email. Plain text format.</p>
            </div>
            <textarea
              className="input"
              rows={3}
              style={{ width: "100%", maxWidth: "340px", fontSize: "12.5px" }}
              placeholder="Best,&#10;Favour Afolayan&#10;BuildWithAfolayan"
              value={settings.emailSignature || ""}
              onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Admin Notification Email</p>
              <p className="settings-row-description">Operator contact for critical alerts and daily summary reports.</p>
            </div>
            <input
              type="email"
              className="input"
              style={{ width: "240px" }}
              value={settings.adminEmail}
              onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
            />
          </div>
        </div>

        {/* Save Button Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || loading}
            style={{ padding: "10px 24px" }}
          >
            {saving ? "Saving Changes..." : "Save Configuration"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="settings-section" style={{ borderColor: "rgba(248, 113, 113, 0.2)" }}>
        <h2 className="settings-section-title" style={{ color: "var(--danger)" }}>Danger Zone</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Emergency Stop</p>
            <p className="settings-row-description">
              Immediately pause all campaigns and halt all pending sends across the entire operating system.
            </p>
          </div>
          <button type="button" className="btn btn-danger" onClick={handleEmergencyStop}>
            Emergency Stop All
          </button>
        </div>
      </div>
    </div>
  );
}
