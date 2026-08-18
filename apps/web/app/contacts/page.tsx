"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ImportCSVModal from "../components/ImportCSVModal";
import AddContactModal from "../components/AddContactModal";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website?: string;
  city?: string;
  industry?: string;
  state: string;
  source: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  lastActivity?: string;
}

const filters = ["All", "Ready", "Enrolled", "Replied", "Completed"];

const avatarGradients = [
  "linear-gradient(135deg, #007aff, #5856d6)",
  "linear-gradient(135deg, #00c7be, #009688)",
  "linear-gradient(135deg, #af52de, #7c3aed)",
  "linear-gradient(135deg, #ff9500, #ea580c)",
  "linear-gradient(135deg, #ff2d55, #c2185b)",
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (e) {
      console.error("Failed to load contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      `${c.firstName} ${c.lastName} ${c.email} ${c.company} ${c.industry || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      c.state.toUpperCase() === activeFilter.toUpperCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <Header
        eyebrow="Target Directory"
        title="Prospects & Leads"
        description="Manage B2B targets, import CSV lists, and trigger Gemini AI bespoke personalization."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowImportModal(true)}
            >
              <span>📄</span>
              <span>Import CSV</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <span>+</span>
              <span>Add Contact</span>
            </button>
          </div>
        }
      />

      {/* Apple Filter & Search Toolbar */}
      <div
        className="ios-glass"
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* iOS Segmented Control */}
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

        {/* Search Field */}
        <div style={{ minWidth: "260px", flex: 1, maxWidth: "380px" }}>
          <input
            type="text"
            className="input"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts List Grid */}
      {contacts.length === 0 && !loading ? (
        <EmptyState
          icon="◉"
          title="No prospects imported yet"
          description="Upload a CSV file or add your target prospects to begin sequence enrollment."
          action={
            <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
              Upload First CSV
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredContacts.map((contact, idx) => {
            const initials = `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase() || "P";
            const gradient = avatarGradients[idx % avatarGradients.length];

            return (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="ios-card-interactive" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "14px",
                          color: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "14.5px", fontWeight: 750, color: "#ffffff" }}>
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                          {contact.company || "Independent"}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={contact.state} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>✉</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {contact.email}
                      </span>
                    </div>

                    {contact.city && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "var(--text-tertiary)" }}>📍</span>
                        <span>{contact.city}</span>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px 10px",
                        background: "rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                        fontSize: "11.5px",
                        color: "var(--text-tertiary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {contact.notes}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          fetchContacts();
        }}
      />

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchContacts();
        }}
      />
    </div>
  );
}
