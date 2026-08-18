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
        background: "radial-gradient(ellipse at 50% 30%, hsl(220 35% 8%), hsl(220 30% 4%))",
        color: "var(--text-primary)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(230 70% 45% / 0.12), transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Identity */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, hsl(230 80% 60%), hsl(260 70% 50%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              color: "#ffffff",
              boxShadow: "0 8px 24px hsl(230 80% 50% / 0.35)",
            }}
          >
            F
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "6px",
              color: "#ffffff",
            }}
          >
            Favour Outreach OS
          </h1>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "100px",
              background: "hsl(220 25% 14%)",
              border: "1px solid hsl(220 20% 22%)",
              color: "hsl(220 20% 70%)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "hsl(160 80% 45%)",
              }}
            />
            Private Command Center
          </div>
        </div>

        {/* Access Form Card */}
        <div
          style={{
            background: "hsl(220 25% 9% / 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(220 20% 18%)",
            borderRadius: "16px",
            padding: "32px 28px",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "hsl(220 15% 65%)",
                  marginBottom: "8px",
                  letterSpacing: "0.02em",
                }}
              >
                Access Key / Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter system password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 14px",
                    background: "hsl(220 30% 6%)",
                    border: "1px solid hsl(220 20% 20%)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "hsl(230 70% 60%)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px hsl(230 70% 60% / 0.2)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "hsl(220 20% 20%)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "hsl(220 15% 55%)",
                    cursor: "pointer",
                    fontSize: "13px",
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
                  background: "hsl(0 60% 15% / 0.6)",
                  border: "1px solid hsl(0 60% 30% / 0.8)",
                  borderRadius: "8px",
                  color: "hsl(0 80% 70%)",
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
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, hsl(230 75% 58%), hsl(250 65% 52%))",
                border: "none",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isLoading || !password ? "not-allowed" : "pointer",
                opacity: isLoading || !password ? 0.6 : 1,
                transition: "opacity 0.2s, transform 0.1s",
                boxShadow: "0 4px 16px hsl(230 70% 50% / 0.3)",
              }}
            >
              {isLoading ? "Verifying..." : "Authenticate & Enter →"}
            </button>
          </form>
        </div>

        {/* Subtle Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "11px",
            color: "hsl(220 15% 45%)",
            letterSpacing: "0.02em",
          }}
        >
          Protected Single-Operator Instance · Encrypted Session
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
            background: "hsl(220 30% 4%)",
            color: "hsl(220 15% 55%)",
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
