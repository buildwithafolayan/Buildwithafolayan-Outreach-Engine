"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, UploadCloud, Mail, MapPin, Building, Users } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Header
        eyebrow="Target Directory"
        title="Prospects"
        description="Target contact list with AI personalization triggers and sequence state."
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowImportModal(true)}
            >
              <UploadCloud size={14} strokeWidth={1.75} />
              <span>Import CSV</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} strokeWidth={2} />
              <span>Add Contact</span>
            </button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
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

        {/* Search Field */}
        <div style={{ position: "relative", minWidth: "260px", maxWidth: "340px", flex: 1 }}>
          <Search
            size={14}
            strokeWidth={1.75}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "32px", fontSize: "12.5px" }}
            placeholder="Search name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contacts Grid / Table */}
      {contacts.length === 0 && !loading ? (
        <EmptyState
          icon={Users}
          title="No prospects imported"
          description="Upload a CSV target file or add contacts to enroll in campaigns."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowImportModal(true)}
            >
              Import CSV
            </button>
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "14px",
          }}
        >
          {filteredContacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card-interactive"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 650, color: "var(--text-primary)" }}>
                      {contact.firstName} {contact.lastName}
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      {contact.company || "Company unassigned"}
                    </p>
                  </div>
                  <StatusBadge status={contact.state} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Mail size={13} strokeWidth={1.75} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contact.email}
                    </span>
                  </div>

                  {contact.city && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={13} strokeWidth={1.75} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                      <span>{contact.city}</span>
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <div
                    style={{
                      marginTop: "auto",
                      padding: "6px 8px",
                      backgroundColor: "var(--bg-surface-elevated)",
                      borderRadius: "var(--radius-xs)",
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
          ))}
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
