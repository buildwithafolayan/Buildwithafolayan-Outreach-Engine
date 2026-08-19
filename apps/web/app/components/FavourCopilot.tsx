"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Maximize2,
  Minimize2,
  Columns,
  Terminal,
  Check,
} from "lucide-react";

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
        "Hello Favour. I am your outreach intelligence copilot. How can I help analyze campaigns, prioritize leads, or draft sequences today?",
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
            content: "I encountered an issue processing that query. Please check server logs.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network connection error reaching AI Copilot.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Show contacts who replied positively",
    "Analyze campaign performance",
    "What should I focus on today?",
    "Check system & Gmail status",
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 45,
          backgroundColor: "var(--bg-surface-elevated)",
          color: "var(--text-primary)",
          borderRadius: "var(--radius-full)",
          padding: "8px 14px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border-default)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-strong)";
          e.currentTarget.style.backgroundColor = "var(--bg-surface-active)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.backgroundColor = "var(--bg-surface-elevated)";
        }}
        title="Open Favour Copilot (⌘K)"
      >
        <Sparkles size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
        <span>Favour AI</span>
        <span
          style={{
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ⌘K
        </span>
      </button>
    );
  }

  const getContainerStyle = (): React.CSSProperties => {
    switch (position) {
      case "fullscreen":
        return {
          position: "fixed",
          inset: "20px",
          zIndex: 50,
          borderRadius: "var(--radius-lg)",
        };
      case "floating":
        return {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "440px",
          height: "620px",
          zIndex: 50,
          borderRadius: "var(--radius-lg)",
        };
      case "docked":
      default:
        return {
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "440px",
          zIndex: 50,
          borderLeft: "1px solid var(--border-default)",
        };
    }
  };

  return (
    <div
      style={{
        ...getContainerStyle(),
        backgroundColor: "var(--bg-surface)",
        boxShadow: "var(--shadow-dialog)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: position !== "docked" ? "1px solid var(--border-default)" : undefined,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-surface-elevated)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
            }}
          >
            <Sparkles size={14} strokeWidth={2} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                Favour AI
              </span>
              <span className="badge badge-success" style={{ fontSize: "10px", padding: "1px 6px" }}>
                Online
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              {pathname === "/" ? "Dashboard" : pathname}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            type="button"
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
            title="Toggle panel layout"
            style={{ padding: "4px 8px" }}
          >
            {position === "docked" ? (
              <Columns size={14} />
            ) : position === "floating" ? (
              <Maximize2 size={14} />
            ) : (
              <Minimize2 size={14} />
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsOpen(false)}
            title="Close panel"
            style={{ padding: "4px 8px" }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
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
                maxWidth: "90%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor:
                  m.role === "user" ? "#fafafa" : "var(--bg-surface-elevated)",
                color: m.role === "user" ? "#09090b" : "var(--text-primary)",
                border:
                  m.role === "user"
                    ? "1px solid #fafafa"
                    : "1px solid var(--border-default)",
                fontSize: "13px",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>

            {/* Tool execution badge */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div style={{ marginTop: "6px", display: "grid", gap: "4px", width: "100%" }}>
                {m.toolCalls.map((tc, tIdx) => (
                  <div
                    key={tIdx}
                    style={{
                      fontSize: "11px",
                      padding: "4px 10px",
                      backgroundColor: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-xs)",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Terminal size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
                    <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {tc.name}
                    </code>
                    <span style={{ color: "#34d399", marginLeft: "auto", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Check size={11} strokeWidth={2.5} /> done
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
              gap: "8px",
              color: "var(--text-secondary)",
              fontSize: "12px",
              padding: "6px 10px",
              backgroundColor: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--border-subtle)",
              width: "fit-content",
            }}
          >
            <Sparkles size={13} className="animate-pulse" style={{ color: "var(--accent)" }} />
            <span>Reasoning across outreach data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Action Pills */}
      {messages.length <= 2 && (
        <div style={{ padding: "0 16px 10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "11px", padding: "4px 10px" }}
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
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface-elevated)",
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
            style={{ flex: 1, fontSize: "13px" }}
            placeholder="Ask Copilot to analyze, search, compose..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !input.trim()}
            style={{ padding: "0 12px" }}
          >
            <Send size={13} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
