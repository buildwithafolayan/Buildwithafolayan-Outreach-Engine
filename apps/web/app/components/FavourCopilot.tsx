"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
}

type PanelPosition = "docked" | "floating" | "fullscreen";

export default function FavourCopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition>("docked");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Greetings Favour. I am your Apple Intelligence sales operations copilot. How can I optimize your campaigns, prospects, or outreach pipelines today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (userPrompt?: string) => {
    const promptToSend = userPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: promptToSend.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (!userPrompt) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/favour/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: { currentPage: pathname },
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I encountered an issue processing that action. Please check system logs.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network connection timeout connecting to Favour AI Copilot.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Show me contacts who replied positively",
    "Analyze campaign performance",
    "What should I focus on today?",
    "Check system & Gmail status",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="ios-glass"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 900,
          background: "rgba(18, 22, 34, 0.85)",
          color: "#ffffff",
          borderRadius: "100px",
          padding: "10px 18px",
          fontSize: "13px",
          fontWeight: 650,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          transition: "transform 0.2s var(--ease-spring), box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px) scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0) scale(1)")}
        title="Open Favour Copilot (Cmd+K)"
      >
        {/* Apple Intelligence Aurora Orb */}
        <div
          className="apple-intelligence-glow animate-pulse-glow"
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(175, 82, 222, 0.6)",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff" }}>✦</span>
        </div>
        <span style={{ letterSpacing: "-0.01em" }}>Favour AI</span>
        <span
          style={{
            fontSize: "10px",
            padding: "2px 7px",
            borderRadius: "100px",
            background: "rgba(255, 255, 255, 0.12)",
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
          }}
        >
          ⌘K
        </span>
      </button>
    );
  }

  // Position Styling
  const getContainerStyle = (): React.CSSProperties => {
    switch (position) {
      case "fullscreen":
        return {
          position: "fixed",
          inset: "24px",
          zIndex: 1000,
          borderRadius: "28px",
        };
      case "floating":
        return {
          position: "fixed",
          bottom: "28px",
          right: "28px",
          width: "440px",
          height: "640px",
          zIndex: 1000,
          borderRadius: "24px",
        };
      case "docked":
      default:
        return {
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "460px",
          zIndex: 1000,
          borderLeft: "1px solid var(--border-default)",
        };
    }
  };

  return (
    <div
      className="ios-glass"
      style={{
        ...getContainerStyle(),
        background: "rgba(10, 14, 23, 0.88)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        boxShadow: "0 28px 72px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: position !== "docked" ? "1px solid var(--border-strong)" : undefined,
      }}
    >
      {/* Header with Apple Intelligence Bar */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            className="apple-intelligence-glow"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(175, 82, 222, 0.4)",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>✦</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 750 }}>Favour</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "100px",
                  background: "rgba(16, 185, 129, 0.16)",
                  color: "#34d399",
                  fontWeight: 650,
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                Intelligence Active
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              Context: {pathname === "/" ? "Dashboard" : pathname}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Position Selector */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setPosition(
                position === "docked"
                  ? "floating"
                  : position === "floating"
                  ? "fullscreen"
                  : "docked"
              )
            }
            title={`Switch mode (currently ${position})`}
          >
            {position === "docked" ? "◫ Float" : position === "floating" ? "⛶ Max" : "⇲ Dock"}
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setIsOpen(false)}
            title="Close Favour Copilot"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                maxWidth: "88%",
                padding: "14px 18px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, #007aff, #5856d6)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  m.role === "user"
                    ? "1px solid rgba(255, 255, 255, 0.2)"
                    : "1px solid var(--border-default)",
                color: "#ffffff",
                fontSize: "13.5px",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                boxShadow:
                  m.role === "user"
                    ? "0 8px 20px rgba(0, 122, 255, 0.3)"
                    : "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              }}
            >
              {m.content}
            </div>

            {/* Tool execution badge */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div style={{ marginTop: "8px", display: "grid", gap: "4px", width: "100%" }}>
                {m.toolCalls.map((tc, tIdx) => (
                  <div
                    key={tIdx}
                    style={{
                      fontSize: "11.5px",
                      padding: "6px 12px",
                      background: "rgba(99, 102, 241, 0.08)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "8px",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>⚡ Tool:</span>
                    <code style={{ fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                      {tc.name}
                    </code>
                    <span style={{ color: "var(--success)", marginLeft: "auto", fontWeight: 600 }}>
                      ✓ completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-secondary)",
              fontSize: "12.5px",
              padding: "8px 12px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "10px",
              width: "fit-content",
            }}
          >
            <div
              className="apple-intelligence-glow animate-pulse-glow"
              style={{ width: "10px", height: "10px", borderRadius: "50%" }}
            />
            Favour is reasoning across database models...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Action Pills */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 20px 12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: "11.5px",
                padding: "6px 12px",
                borderRadius: "100px",
              }}
              onClick={() => handleSend(qp)}
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            className="input"
            style={{ width: "100%", fontSize: "13.5px" }}
            placeholder="Ask Favour to analyze, pause, prioritize..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0 18px" }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
