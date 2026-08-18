"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <Header
        eyebrow="Outbound Sequences"
        title="Email Campaigns"
        description="Design multi-step email cadences with Gemini AI copywriting and track automated sending."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span>+</span>
            <span>New Campaign</span>
          </button>
        }
      />

      {/* iOS Segmented Filter Control */}
      <div
        className="ios-glass"
        style={{
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="ios-segmented-control">
          {filters.map((f) => (
            <button
              key={f}
              className={`ios-segment-btn${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
          {filteredCampaigns.length} sequence{filteredCampaigns.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 && !loading ? (
        <EmptyState
          icon="◈"
          title="No campaigns created yet"
          description="Create your first sequence with Gemini AI to automate outreach to your prospect targets."
          action={
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Campaign
            </button>
          }
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
          {filteredCampaigns.map((camp) => (
            <Link
              key={camp.id}
              href={`/campaigns/${camp.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="ios-card-interactive">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 750, color: "#ffffff", marginBottom: "4px" }}>
                      {camp.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", maxWidth: "260px" }}>
                      {camp.description || "No description provided"}
                    </p>
                  </div>
                  <StatusBadge status={camp.status} />
                </div>

                {/* Steps Visual Rail */}
                <div style={{ margin: "16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  {(camp.steps || []).map((step, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)" }}>
                        STEP {step.number}
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
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Enrolled</span>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                      {camp.enrolledCount || 0}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Dispatched</span>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>
                      {camp.sentCount || 0}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Replies</span>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--success)" }}>
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
