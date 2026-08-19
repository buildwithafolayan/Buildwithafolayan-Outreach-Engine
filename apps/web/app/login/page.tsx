"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const from = searchParams.get("from") || "/";
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || "Access denied. Please check your password.");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Network connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-primary)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          width: "100%",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--text-primary)",
              color: "var(--bg-canvas)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            B
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginBottom: "4px",
              color: "var(--text-primary)",
            }}
          >
            BuildWithAfolayan
          </h1>
          <p style={{ fontSize: "12.5px", color: "var(--text-tertiary)" }}>
            Private Outreach Engine
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "28px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Access Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter system password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  className="input"
                  style={{
                    paddingRight: "38px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={14} strokeWidth={1.75} />
                  ) : (
                    <Eye size={14} strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "var(--danger-soft)",
                  border: "1px solid var(--danger-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "#f87171",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "9px 14px",
                fontSize: "13px",
              }}
            >
              <span>{isLoading ? "Authenticating..." : "Enter Workspace"}</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </form>
        </div>

        {/* Security badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          <ShieldCheck size={13} strokeWidth={1.75} />
          <span>Single-operator encrypted session</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--bg-canvas)",
            color: "var(--text-muted)",
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
