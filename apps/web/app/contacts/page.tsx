import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

export const metadata: Metadata = {
  title: "Contacts",
};

// Demo data — will be replaced by Supabase queries
const contacts = [
  { id: "c1", firstName: "Sarah", lastName: "Chen", email: "sarah@techcorp.io", company: "TechCorp", state: "READY", lastActivity: "Imported 2 days ago" },
  { id: "c2", firstName: "Marcus", lastName: "Williams", email: "marcus@growthly.com", company: "Growthly", state: "ENROLLED", lastActivity: "Enrolled in Q3 Outreach" },
  { id: "c3", firstName: "Aisha", lastName: "Okonkwo", email: "aisha@venturex.ng", company: "VentureX", state: "REPLIED", lastActivity: "Replied 4 hours ago" },
  { id: "c4", firstName: "David", lastName: "Kim", email: "david@scalehouse.co", company: "ScaleHouse", state: "WAITING", lastActivity: "Step 2 sent yesterday" },
  { id: "c5", firstName: "Elena", lastName: "Petrova", email: "elena@nexaflow.eu", company: "NexaFlow", state: "COMPLETED", lastActivity: "Sequence completed" },
  { id: "c6", firstName: "James", lastName: "Okafor", email: "james@brightedge.io", company: "BrightEdge", state: "BOUNCED", lastActivity: "Email bounced" },
];

const filters = ["All", "Ready", "Enrolled", "Waiting", "Replied", "Completed", "Bounced"];

export default function ContactsPage() {
  const isEmpty = false; // Toggle to show empty state

  return (
    <div className="animate-in">
      <Header
        eyebrow="Contacts"
        title="Your outreach targets"
        description="Manage contacts, import CSV files, and track lifecycle states across campaigns."
        actions={
          <>
            <button className="btn btn-secondary">Import CSV</button>
            <button className="btn btn-primary">Add Contact</button>
          </>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon="◉"
          title="No contacts yet"
          description="Import a CSV file or add contacts manually to start building your outreach list."
          action={<button className="btn btn-primary">Import Your First CSV</button>}
        />
      ) : (
        <>
          {/* Filter bar */}
          <div className="filter-bar">
            <input
              type="text"
              className="input search-input"
              placeholder="Search contacts..."
              style={{ width: "280px" }}
            />
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-chip${f === "All" ? " active" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>State</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/contacts/${c.id}`} className="table-name">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td><span className="table-email">{c.email}</span></td>
                    <td>{c.company}</td>
                    <td><StatusBadge status={c.state} /></td>
                    <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>{c.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <span>Showing 1–{contacts.length} of {contacts.length} contacts</span>
              <div className="pagination-buttons">
                <button className="btn btn-ghost" disabled>← Previous</button>
                <button className="btn btn-ghost" disabled>Next →</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
