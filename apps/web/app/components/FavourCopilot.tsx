"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
    result?: any;
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
        "Greetings Favour. I am your outreach operations copilot. How can I assist with your campaigns, prospect pipelines, or follow-up strategy today?",
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
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 900,
          background: "linear-gradient(135deg, hsl(230 80% 55%), hsl(260 70% 50%))",
          color: "#ffffff",
          border: "1px solid hsl(230 80% 70% / 0.3)",
          borderRadius: "100px",
          padding: "12px 20px",
          fontSize: "13px",
          fontWeight: 650,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 12px 32px hsl(230 80% 45% / 0.4), 0 0 0 1px hsl(230 80% 60% / 0.2)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        title="Open Favour AI Copilot (Cmd+K)"
      >
        <span
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffffff, hsl(230 80% 85%))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 800,
            color: "hsl(230 80% 40%)",
          }}
        >
          F
        </span>
        <span>Favour AI</span>
        <span
          style={{
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: "hsl(0 0% 100% / 0.2)",
            letterSpacing: "0.05em",
          }}
        >
          ⌘K
        </span>
      </button>
    );
  }

  // Panel Styling per Position
  const getContainerStyle = (): React.CSSProperties => {
    switch (position) {
      case "fullscreen":
        return {
          position: "fixed",
          inset: "20px",
          zIndex: 1000,
          borderRadius: "16px",
        };
      case "floating":
        return {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "440px",
          height: "620px",
          zIndex: 1000,
          borderRadius: "16px",
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
      style={{
        ...getContainerStyle(),
        background: "hsl(220 30% 7% / 0.95)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: position !== "docked" ? "1px solid var(--border-default)" : undefined,
      }}
    >
      {/* Copilot Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "hsl(220 25% 10% / 0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, hsl(230 80% 60%), hsl(260 70% 50%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              color: "#ffffff",
              boxShadow: "0 4px 12px hsl(230 80% 50% / 0.4)",
            }}
          >
            F
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Favour</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "100px",
                  background: "hsl(160 70% 20%)",
                  color: "hsl(160 80% 60%)",
                  fontWeight: 600,
                }}
              >
                Copilot Active
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              Page context: {pathname === "/" ? "Dashboard" : pathname}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Position Selector */}
          <button
            className="btn btn-ghost"
            style={{ padding: "4px 6px", fontSize: "11px" }}
            onClick={() =>
              setPosition(position === "docked" ? "floating" : position === "floating" ? "fullscreen" : "docked")
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

      {/* Messages Scroll Area */}
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
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, hsl(230 75% 55%), hsl(245 65% 50%))"
                    : "hsl(220 25% 12%)",
                border: m.role === "user" ? "none" : "1px solid var(--border-default)",
                color: "#ffffff",
                fontSize: "13px",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                boxShadow: m.role === "user" ? "0 4px 16px hsl(230 70% 45% / 0.25)" : undefined,
              }}
            >
              {m.content}
            </div>

            {/* Render Tool Execution Badges if any */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div style={{ marginTop: "8px", display: "grid", gap: "4px", width: "100%" }}>
                {m.toolCalls.map((tc, tIdx) => (
                  <div
                    key={tIdx}
                    style={{
                      fontSize: "11px",
                      padding: "4px 10px",
                      background: "hsl(220 30% 10%)",
                      border: "1px solid hsl(220 25% 18%)",
                      borderRadius: "6px",
                      color: "hsl(220 20% 70%)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>⚡ Tool:</span>
                    <code>{tc.name}</code>
                    <span style={{ color: "var(--success)", marginLeft: "auto" }}>✓ completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", fontSize: "12px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "pulse 1.2s infinite",
              }}
            />
            Favour is analyzing system state & executing tools...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 20px 12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              className="btn btn-ghost"
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                background: "hsl(220 25% 12%)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "100px",
                color: "var(--text-secondary)",
              }}
              onClick={() => handleSend(qp)}
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "hsl(220 25% 9% / 0.8)",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            className="input"
            style={{ width: "100%", fontSize: "13px", padding: "10px 14px" }}
            placeholder="Ask Favour to analyze, pause, prioritize..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0 16px" }}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
