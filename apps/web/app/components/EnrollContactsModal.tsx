"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import StatusBadge from "./StatusBadge";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  state: string;
}

interface EnrollContactsModalProps {
  campaignId: string;
  campaignName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollContactsModal({
  campaignId,
  campaignName,
  isOpen,
  onClose,
  onSuccess,
}: EnrollContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts) {
          setContacts(data.contacts);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const filteredContacts = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.company}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleEnroll = async () => {
    if (selectedIds.size === 0) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
        setSelectedIds(new Set());
      } else {
        alert(data.error || "Failed to enroll contacts");
      }
    } catch (e) {
      console.error(e);
      alert("Network error enrolling contacts");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card glass>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Enroll Contacts</h3>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                Assign prospects to &ldquo;{campaignName}&rdquo; sequence
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: "var(--space-4)", display: "flex", gap: "var(--space-2)" }}>
            <input
              type="text"
              className="input"
              style={{ width: "100%" }}
              placeholder="Search contacts by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ whiteSpace: "nowrap" }}
              onClick={toggleSelectAll}
            >
              {selectedIds.size === filteredContacts.length && filteredContacts.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          {/* Contact selection table */}
          <div
            style={{
              maxHeight: "320px",
              overflowY: "auto",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              marginBottom: "var(--space-4)",
            }}
          >
            {loading ? (
              <p style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>
                Loading contacts...
              </p>
            ) : filteredContacts.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>
                No eligible contacts found. Import a CSV first.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c) => {
                    const isSelected = selectedIds.has(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--bg-tertiary)" : undefined,
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{c.email}</td>
                        <td>{c.company}</td>
                        <td><StatusBadge status={c.state} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Selected: <strong>{selectedIds.size}</strong> contacts
            </span>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEnroll}
                disabled={selectedIds.size === 0 || enrolling}
              >
                {enrolling
                  ? "Enrolling..."
                  : `Enroll ${selectedIds.size} Contacts`}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
