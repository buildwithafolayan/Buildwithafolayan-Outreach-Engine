"use client";

import { useEffect, useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Enroll Prospects
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
              Assign contacts to &ldquo;{campaignName}&rdquo; sequence
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: "4px" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={13}
              strokeWidth={1.75}
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "30px", fontSize: "12.5px" }}
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleSelectAll}
          >
            {selectedIds.size === filteredContacts.length && filteredContacts.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Contacts table */}
        <div
          style={{
            maxHeight: "280px",
            overflowY: "auto",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "16px",
          }}
        >
          {loading ? (
            <p style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
              Loading contacts...
            </p>
          ) : filteredContacts.length === 0 ? (
            <p style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
              No contacts found. Import a CSV target list first.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Status</th>
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
                        backgroundColor: isSelected ? "var(--bg-surface-elevated)" : undefined,
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
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.firstName} {c.lastName}</td>
                      <td>{c.email}</td>
                      <td>{c.company}</td>
                      <td><StatusBadge status={c.state} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
            Selected: <strong style={{ color: "var(--text-primary)" }}>{selectedIds.size}</strong> contacts
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEnroll}
              disabled={selectedIds.size === 0 || enrolling}
            >
              {enrolling ? "Enrolling..." : `Enroll ${selectedIds.size} Contacts`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
