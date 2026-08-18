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

const filters = ["All", "Ready", "Enrolled", "Waiting", "Replied", "Completed", "Bounced"];

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
    <div className="animate-in">
      <Header
        eyebrow="Contacts"
        title="Your outreach targets"
        description="Manage contacts, import CSV files, and track lifecycle states across campaigns."
        actions={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowImportModal(true)}
            >
              📄 Import CSV
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add Contact
            </button>
          </div>
        }
      />

      {contacts.length === 0 && !loading ? (
        <EmptyState
          icon="◉"
          title="No contacts yet"
          description="Import a CSV file or add contacts manually to start building your outreach list."
          action={
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddModal(true)}
              >
                Add Manually
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowImportModal(true)}
              >
                Import Your First CSV
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* Filter and Search bar */}
          <div className="filter-bar" style={{ flexWrap: "wrap", gap: "var(--space-2)" }}>
            <input
              type="text"
              className="input search-input"
              placeholder="Search by name, email, company..."
              style={{ width: "300px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>State</th>
                  <th>Source</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link href={`/contacts/${c.id}`} className="table-name">
                          {c.firstName} {c.lastName}
                        </Link>
                      </td>
                      <td><span className="table-email">{c.email}</span></td>
                      <td>{c.company}</td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                        {c.industry || "—"}
                      </td>
                      <td><StatusBadge status={c.state} /></td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                        {c.source || "Manual"}
                      </td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                        {c.lastActivity || "Recently added"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-tertiary)" }}>
                      No contacts found matching &ldquo;{searchQuery || activeFilter}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pagination">
              <span>Showing {filteredContacts.length} of {contacts.length} total contacts</span>
              <div className="pagination-buttons">
                <button className="btn btn-ghost" disabled>← Previous</button>
                <button className="btn btn-ghost" disabled>Next →</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchContacts}
      />

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchContacts}
      />
    </div>
  );
}
