"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Plus, Layers, Inbox } from "lucide-react";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import CreateCampaignModal from "../components/CreateCampaignModal";

interface SequenceStep {
  number: number;
  subject: string;
  bodyText: string;
  delayDays: number;
  delayDescription: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  description: string;
  steps: SequenceStep[];
  enrolledCount: number;
  sentCount: number;
  repliedCount: number;
  replyRate: string;
  nextAction?: string;
}

const filters = ["All", "Active", "Draft", "Paused"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error("Failed to load campaigns:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeFilter === "All") return true;
    return c.status.toUpperCase() === activeFilter.toUpperCase();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Header
        eyebrow="Outbound Sequences"
        title="Campaigns"
        description="Multi-step automated email cadences with AI generation and reply tracking."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} strokeWidth={2} />
            <span>New Campaign</span>
          </button>
        }
      />

      {/* Filter Chips Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div className="filter-bar">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-chip${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          {filteredCampaigns.length} total
        </span>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 && !loading ? (
        <EmptyState
          icon={Send}
          title="No campaigns found"
          description="Create your first outbound sequence to automate prospect outreach."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Campaign
            </button>
          }
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {filteredCampaigns.map((camp) => (
            <Link
              key={camp.id}
              href={`/campaigns/${camp.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card-interactive"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 650, color: "var(--text-primary)" }}>
                      {camp.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px", maxWidth: "260px" }}>
                      {camp.description || "No description provided"}
                    </p>
                  </div>
                  <StatusBadge status={camp.status} />
                </div>

                {/* Steps Mini Preview */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {(camp.steps || []).map((step, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        flex: 1,
                        padding: "6px",
                        backgroundColor: "var(--bg-surface-elevated)",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-subtle)",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        Step {step.number}
                      </span>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                        }}
                      >
                        {step.subject || "Email"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Metrics Footer */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border-subtle)",
                    textAlign: "center",
                    marginTop: "auto",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Enrolled</span>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {camp.enrolledCount || 0}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Dispatched</span>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {camp.sentCount || 0}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Replies</span>
                    <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                      {camp.repliedCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchCampaigns();
        }}
      />
    </div>
  );
}
