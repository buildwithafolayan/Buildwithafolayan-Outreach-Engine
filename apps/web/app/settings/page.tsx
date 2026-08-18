import type { Metadata } from "next";
import Header from "../components/Header";
import GmailConnectSection from "../components/GmailConnectSection";
import GlobalSendingSwitch from "../components/GlobalSendingSwitch";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="animate-in">
      <Header
        eyebrow="Settings"
        title="Configuration"
        description="Manage global sending controls, rate limits, working hours, and your Gmail connection."
      />

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
      <div className="settings-section">
        <h2 className="settings-section-title">Rate Limits</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Daily Send Limit</p>
            <p className="settings-row-description">Maximum emails sent per calendar day across all campaigns.</p>
          </div>
          <span className="settings-row-value">20</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Hourly Send Limit</p>
            <p className="settings-row-description">Maximum emails sent per hour to stay within Gmail guidelines.</p>
          </div>
          <span className="settings-row-value">5</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Campaign Failure Threshold</p>
            <p className="settings-row-description">Auto-pause a campaign after this many consecutive send failures.</p>
          </div>
          <span className="settings-row-value">3</span>
        </div>
      </div>

      {/* Working Hours */}
      <div className="settings-section">
        <h2 className="settings-section-title">Working Hours</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Time Zone</p>
            <p className="settings-row-description">All scheduling and working-hour calculations use this time zone.</p>
          </div>
          <span className="settings-row-value">Africa/Lagos</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Send Window</p>
            <p className="settings-row-description">Emails are only sent during these hours. Sends outside this window are rescheduled.</p>
          </div>
          <span className="settings-row-value">9:00 AM – 5:00 PM</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Active Days</p>
            <p className="settings-row-description">Sending only happens on these days of the week.</p>
          </div>
          <span className="settings-row-value">Mon – Fri</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Randomized Delay</p>
            <p className="settings-row-description">Jitter added to scheduled times to appear more natural.</p>
          </div>
          <span className="settings-row-value">0 – 15 min</span>
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
          <span className="settings-row-value" style={{ color: "var(--accent)" }}>gemini-2.5-flash (Gemini Flash)</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">API Status</p>
            <p className="settings-row-description">API Key configured in environment.</p>
          </div>
          <span className="badge badge-success"><span className="badge-dot" />Connected & Active</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Capabilities</p>
            <p className="settings-row-description">Automated intent & reply classification, dynamic hook generation, multi-step sequence builder.</p>
          </div>
          <span className="settings-row-value">3 Active Handlers</span>
        </div>
      </div>

      {/* Sender Identity */}
      <div className="settings-section">
        <h2 className="settings-section-title">Sender Identity</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Email Signature</p>
            <p className="settings-row-description">Appended to every outbound email. Plain text only in V1.</p>
          </div>
          <span className="settings-row-value">Not configured</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Admin Email</p>
            <p className="settings-row-description">Operator contact for system notifications.</p>
          </div>
          <span className="settings-row-value">you@example.com</span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section" style={{ borderColor: "rgba(248, 113, 113, 0.2)" }}>
        <h2 className="settings-section-title" style={{ color: "var(--danger)" }}>Danger Zone</h2>
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Emergency Stop</p>
            <p className="settings-row-description">
              Immediately pause all campaigns and cancel all pending sends. Use in case of emergency.
            </p>
          </div>
          <button className="btn btn-danger">Emergency Stop All</button>
        </div>
      </div>
    </div>
  );
}
