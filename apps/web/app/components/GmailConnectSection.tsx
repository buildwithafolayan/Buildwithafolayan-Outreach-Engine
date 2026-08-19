"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, AlertCircle, X, Send, Unlink } from "lucide-react";

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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        setErrorMessage(decodeURIComponent(err));
      }
    }
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
        <p style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>Checking connection status...</p>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Gmail Connection</h2>

      {errorMessage && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--danger-soft)",
            color: "var(--danger)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12.5px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid var(--danger-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={15} strokeWidth={2} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--danger)", padding: "2px" }}
            onClick={() => setErrorMessage(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

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
              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>
                {account.email}
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <p className="settings-row-label">Session Timestamp</p>
              <p className="settings-row-description">Authorized date.</p>
            </div>
            <span style={{ color: "var(--text-secondary)", fontSize: "12.5px", fontFamily: "var(--font-mono)" }}>
              {new Date(account.connectedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Test Email Verification Box */}
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Send size={15} strokeWidth={1.75} style={{ color: "var(--text-primary)" }} />
              <h3 style={{ fontSize: "13px", fontWeight: 650, color: "var(--text-primary)" }}>
                Test Send Verification
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "12px" }}>
              Send an immediate test message through the Gmail API to verify your connection.
            </p>

            <div style={{ display: "flex", gap: "8px", maxWidth: "480px" }}>
              <input
                type="email"
                className="input"
                style={{ flex: 1 }}
                placeholder="recipient@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSendTest}
                disabled={sendingTest || !testRecipient}
              >
                {sendingTest ? "Sending..." : "Send Test"}
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "12px",
                  background: testResult.success ? "var(--success-soft)" : "var(--danger-soft)",
                  color: testResult.success ? "#34d399" : "#f87171",
                  border: testResult.success ? "1px solid var(--success-border)" : "1px solid var(--danger-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {testResult.success ? (
                  <>
                    <CheckCircle2 size={14} strokeWidth={2} />
                    <span>Test email delivered successfully (ID: {testResult.messageId})</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} strokeWidth={2} />
                    <span>{testResult.error}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDisconnect}>
              <Unlink size={13} strokeWidth={1.75} />
              <span>Disconnect Mailbox</span>
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
            <Mail size={14} strokeWidth={1.75} />
            <span>Connect Gmail Account</span>
          </a>
        </div>
      )}
    </div>
  );
}
