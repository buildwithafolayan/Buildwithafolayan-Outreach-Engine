"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
        setError(data.error || "Access denied. Please check your credentials.");
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
        background: "var(--ios-bg-canvas)",
        color: "var(--text-primary)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Apple Ambient Aurora Glow */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(175, 82, 222, 0.08) 40%, transparent 70%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Identity */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            className="apple-intelligence-glow animate-pulse-glow"
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 18px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
              color: "#ffffff",
              boxShadow: "0 12px 32px rgba(175, 82, 222, 0.4)",
            }}
          >
            B
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "6px",
              color: "#ffffff",
            }}
          >
            BuildWithAfolayan
          </h1>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "100px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
              fontWeight: 650,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--success)",
                boxShadow: "0 0 8px var(--success)",
              }}
            />
            Private Command Center
          </div>
        </div>

        {/* Access Form Card */}
        <div
          className="ios-glass"
          style={{
            padding: "36px 30px",
            boxShadow: "0 28px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 650,
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                  letterSpacing: "0.02em",
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
                    paddingRight: "44px",
                    fontSize: "14px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "4px",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  color: "#fca5a5",
                  fontSize: "12px",
                  marginBottom: "18px",
                  lineHeight: 1.4,
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
                padding: "13px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {isLoading ? "Authenticating..." : "Authenticate & Enter →"}
            </button>
          </form>
        </div>

        {/* Subtle Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "0.02em",
          }}
        >
          Single-Operator Instance · Encrypted Session
        </p>
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
            background: "var(--ios-bg-canvas)",
            color: "var(--text-secondary)",
          }}
        >
          Loading access gate...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
