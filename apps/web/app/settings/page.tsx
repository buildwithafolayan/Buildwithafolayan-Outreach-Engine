"use client";

import { useEffect, useState } from "react";
import { Save, Check, AlertOctagon, Clock, Sparkles, ShieldAlert, Mail } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Header
        eyebrow="Settings"
        title="Configuration"
        description="Manage global dispatch guardrails, rate limits, sending windows, and Gmail connection."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave()}
            disabled={saving || loading}
          >
            <Save size={14} strokeWidth={2} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        }
      />

      {saveMessage && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12.5px",
            background: saveMessage.type === "success" ? "var(--success-soft)" : "var(--danger-soft)",
            color: saveMessage.type === "success" ? "#34d399" : "#f87171",
            border: saveMessage.type === "success" ? "1px solid var(--success-border)" : "1px solid var(--danger-border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {saveMessage.type === "success" ? (
            <Check size={14} strokeWidth={2.5} />
          ) : (
            <AlertOctagon size={14} strokeWidth={2} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Global Sending Switch */}
      <div className="settings-section">
        <h2 className="settings-section-title">Dispatch Control</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Master Sending Switch</p>
            <p className="settings-row-description">
              Master control for all automated sends across campaigns. When toggled off, dispatch halts immediately.
            </p>
          </div>
          <GlobalSendingSwitch />
        </div>
      </div>

      {/* Gmail OAuth Connection */}
      <GmailConnectSection />

      {/* Rate Limits & Guardrails */}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div className="settings-section">
          <h2 className="settings-section-title">Rate Limits & Guardrails</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Daily Send Limit</p>
              <p className="settings-row-description">Maximum emails dispatched per day across all sequences.</p>
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
              <p className="settings-row-description">Maximum emails dispatched per hour to stay under Gmail thresholds.</p>
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
              <p className="settings-row-label">Failure Threshold</p>
              <p className="settings-row-description">Auto-pause campaign after this many consecutive bounce/errors.</p>
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

        {/* Working Hours & Schedule */}
        <div className="settings-section">
          <h2 className="settings-section-title">Working Hours & Scheduling</h2>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Time Zone</p>
              <p className="settings-row-description">Timezone used for schedule calculations.</p>
            </div>
            <select
              className="select"
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
              <p className="settings-row-label">Sending Window</p>
              <p className="settings-row-description">Sends are queued and only delivered between these business hours.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="time"
                className="input"
                style={{ width: "auto" }}
                value={settings.sendWindowStart}
                onChange={(e) => setSettings({ ...settings, sendWindowStart: e.target.value })}
              />
              <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>to</span>
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
              <p className="settings-row-label">Randomized Jitter</p>
              <p className="settings-row-description">Random minutes delay added between emails to mimic human behavior.</p>
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

        {/* Sender Identity */}
        <div className="settings-section">
          <h2 className="settings-section-title">Sender Identity</h2>
          <div className="settings-row" style={{ alignItems: "flex-start" }}>
            <div className="settings-row-info">
              <p className="settings-row-label">Email Signature</p>
              <p className="settings-row-description">Appended to every outbound email body in plain text.</p>
            </div>
            <textarea
              className="textarea"
              rows={3}
              style={{ width: "100%", maxWidth: "340px", fontSize: "12px" }}
              placeholder="Best,&#10;Favour Afolayan&#10;BuildWithAfolayan"
              value={settings.emailSignature || ""}
              onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Admin Email</p>
              <p className="settings-row-description">Operator email for critical alert dispatches.</p>
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

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || loading}
          >
            <Save size={14} strokeWidth={2} />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="settings-section" style={{ borderColor: "var(--danger-border)" }}>
        <h2 className="settings-section-title" style={{ color: "var(--danger)" }}>Danger Zone</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Emergency Stop</p>
            <p className="settings-row-description">
              Instantly disable global sending and halt all pending sequences.
            </p>
          </div>
          <button type="button" className="btn btn-danger" onClick={handleEmergencyStop}>
            <ShieldAlert size={14} strokeWidth={2} />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
