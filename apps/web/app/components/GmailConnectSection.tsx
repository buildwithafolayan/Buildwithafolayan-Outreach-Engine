"use client";

import { useEffect, useState } from "react";

interface GmailAccount {
  email: string;
  name?: string;
  picture?: string;
  connectedAt: string;
  hasRefreshToken: boolean;
  status: string;
}

export default function GmailConnectSection() {
  const [account, setAccount] = useState<GmailAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    messageId?: string;
    threadId?: string;
    recipient?: string;
    error?: string;
  } | null>(null);

  const fetchAccount = async () => {
    try {
      const res = await fetch("/api/gmail/account");
      const data = await res.json();
      if (data.account) {
        setAccount(data.account);
        setTestRecipient(data.account.email);
      } else {
        setAccount(null);
      }
    } catch (e) {
      console.error("Failed to load Gmail account info:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Gmail account?")) return;
    try {
      await fetch("/api/gmail/disconnect", { method: "POST" });
      setAccount(null);
      setTestResult(null);
    } catch (e) {
      console.error(e);
      alert("Failed to disconnect Gmail account.");
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/gmail/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testRecipient }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(data);
      } else {
        setTestResult({ success: false, error: data.error || "Send failed" });
      }
    } catch (e) {
      console.error(e);
      setTestResult({ success: false, error: "Network error sending test email" });
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h2 className="settings-section-title">Gmail Connection</h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Checking Gmail connection status...</p>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Gmail Connection</h2>

      {account ? (
        <>
          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Connected Mailbox</p>
              <p className="settings-row-description">
                Active for sending outreach sequences and detecting inbox replies.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-success">
                <span className="badge-dot" />Connected
              </span>
              <span className="settings-row-value" style={{ fontWeight: 600 }}>
                {account.email}
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Connected Since</p>
              <p className="settings-row-description">Session created timestamp.</p>
            </div>
            <span className="settings-row-value">
              {new Date(account.connectedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Controlled Test Send Box */}
          <div style={{ marginTop: "var(--space-5)", padding: "var(--space-4)", background: "var(--bg-tertiary)", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 650, marginBottom: "var(--space-2)" }}>
              🧪 Controlled Test Recipient Verification
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
              Send an instant verification email to test your Gmail connection before launching live campaigns.
            </p>

            <div style={{ display: "flex", gap: "var(--space-2)", maxWidth: "520px", marginBottom: "var(--space-3)" }}>
              <input
                type="email"
                className="input"
                style={{ flex: 1 }}
                placeholder="recipient@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleSendTest}
                disabled={sendingTest || !testRecipient}
              >
                {sendingTest ? "Sending..." : "Send Test Email"}
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: testResult.success ? "var(--success-soft)" : "var(--danger-soft)",
                  color: testResult.success ? "var(--success)" : "var(--danger)",
                }}
              >
                {testResult.success ? (
                  <div>
                    <p style={{ fontWeight: 600 }}>✓ Test email delivered successfully!</p>
                    <p style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>
                      Message ID: {testResult.messageId} · Thread ID: {testResult.threadId}
                    </p>
                  </div>
                ) : (
                  <p>✕ {testResult.error}</p>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-danger" onClick={handleDisconnect}>
              Disconnect Mailbox
            </button>
          </div>
        </>
      ) : (
        <div className="settings-row">
          <div className="settings-row-info">
            <p className="settings-row-label">Connect Google Account</p>
            <p className="settings-row-description">
              Link your Gmail or Google Workspace account via OAuth to send outreach emails and detect replies.
            </p>
          </div>
          <a href="/api/auth/google/connect" className="btn btn-primary">
            Connect Gmail Account
          </a>
        </div>
      )}
    </div>
  );
}
