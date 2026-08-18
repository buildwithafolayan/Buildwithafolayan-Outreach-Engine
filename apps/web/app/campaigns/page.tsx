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

const filters = ["All", "Active", "Draft", "Paused", "Archived"];

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
    <div className="animate-in">
      <Header
        eyebrow="Campaigns"
        title="Outreach campaigns"
        description="Create sequenced email campaigns, manage enrollment, and track performance."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Campaign
          </button>
        }
      />

      {campaigns.length === 0 && !loading ? (
        <EmptyState
          icon="◈"
          title="No campaigns yet"
          description="Create your first campaign to start reaching out to your contacts with sequenced emails."
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
        <>
          <div className="filter-bar">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-chip${activeFilter === f ? " active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {filteredCampaigns.map((c) => (
              <Link href={`/campaigns/${c.id}`} key={c.id} style={{ textDecoration: "none" }}>
                <div className="card card-interactive">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 660, marginBottom: "var(--space-1)" }}>
                        {c.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                        {c.steps?.length || 1} steps · {c.nextAction || "Active sequence"}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Enrolled
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.enrolledCount}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Sent
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.sentCount}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Replied
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.repliedCount}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Reply Rate
                      </p>
                      <p style={{ fontSize: "20px", fontWeight: 700 }}>{c.replyRate}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
}
