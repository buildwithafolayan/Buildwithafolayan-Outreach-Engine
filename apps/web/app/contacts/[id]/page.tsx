import type { Metadata } from "next";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import Card from "../../components/Card";
import AIPersonalizeModal from "@/app/components/AIPersonalizeModal";

export const metadata: Metadata = {
  title: "Contact Detail",
};

// Demo data — will be replaced by Supabase query using the route param
const contact = {
  id: "c1",
  firstName: "Sarah",
  lastName: "Chen",
  email: "sarah@techcorp.io",
  company: "TechCorp",
  website: "techcorp.io",
  city: "San Francisco",
  industry: "SaaS",
  state: "REPLIED",
  source: "CSV Import",
  notes: "VP of Engineering. Scaling team from 30 to 80 devs. Focused on CI/CD latency and developer velocity.",
  tags: ["saas", "engineering-lead", "west-coast"],
};

const enrollments = [
  {
    campaign: "Q3 Developer Outreach",
    state: "REPLIED",
    currentStep: "Step 2 of 4",
    lastAction: "Reply received Aug 15, 2026",
  },
];

const timeline = [
  { icon: "📩", dotClass: "dot-success", event: "Reply received", meta: "Positive sentiment — interested in a demo", time: "Aug 15, 2:34 PM" },
  { icon: "✉️", dotClass: "dot-info", event: "Step 2 sent", meta: "Subject: Quick follow-up on developer tools", time: "Aug 13, 9:15 AM" },
  { icon: "✉️", dotClass: "dot-info", event: "Step 1 sent", meta: "Subject: Helping TechCorp ship faster", time: "Aug 10, 10:00 AM" },
  { icon: "📋", dotClass: "", event: "Enrolled in Q3 Developer Outreach", meta: "4-step sequence", time: "Aug 10, 9:58 AM" },
  { icon: "⬆️", dotClass: "", event: "Imported from CSV", meta: "Batch: q3-targets.csv", time: "Aug 9, 3:22 PM" },
];

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;

  return (
    <div className="animate-in">
      {/* Breadcrumb */}
      <p className="page-eyebrow" style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/contacts" style={{ color: "var(--text-tertiary)" }}>Contacts</Link>
        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>/</span>
        <span>{contact.firstName} {contact.lastName}</span>
      </p>

      {/* Contact header */}
      <div className="detail-header" style={{ flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div className="detail-avatar">
          {contact.firstName[0]}{contact.lastName[0]}
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{contact.firstName} {contact.lastName}</h1>
          <p className="detail-subtitle">
            {contact.email} · {contact.company}
          </p>
        </div>
        <StatusBadge status={contact.state} />
        
        {/* Gemini AI Personalization Trigger */}
        <AIPersonalizeModal
          contact={contact}
          initialSubject="Helping {{company}} ship faster"
          initialBody={`Hi {{first_name}},\n\nI noticed {{company}} is scaling its engineering team. We built a platform that cuts developer pipeline latency by 40%.\n\nWould you be open to a quick 5-minute chat next Tuesday?\n\nBest,\nAfolayan`}
        />
        
        <button className="btn btn-secondary">Edit</button>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left column — info + enrollments */}
        <div>
          {/* Contact Info */}
          <Card>
            <h3 className="section-title" style={{ marginBottom: "var(--space-5)" }}>Contact Info</h3>
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              {[
                ["Email", contact.email],
                ["Company", contact.company],
                ["Website", contact.website],
                ["City", contact.city],
                ["Industry", contact.industry],
                ["Source", contact.source],
                ["ID", id],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
                  <span style={{ fontWeight: 540 }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tags */}
          <div style={{ marginTop: "var(--space-4)" }}>
            <Card>
              <h3 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Tags</h3>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {contact.tags.map((tag) => (
                  <span key={tag} className="badge badge-neutral">{tag}</span>
                ))}
              </div>
            </Card>
          </div>

          {/* Notes */}
          <div style={{ marginTop: "var(--space-4)" }}>
            <Card>
              <h3 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Notes</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{contact.notes}</p>
            </Card>
          </div>

          {/* Enrollments */}
          <div style={{ marginTop: "var(--space-6)" }}>
            <h3 className="section-title" style={{ marginBottom: "var(--space-4)" }}>Enrollments</h3>
            {enrollments.map((e) => (
              <Card key={e.campaign}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
                  <span style={{ fontWeight: 620 }}>{e.campaign}</span>
                  <StatusBadge status={e.state} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{e.currentStep} · {e.lastAction}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column — timeline */}
        <div>
          <Card>
            <h3 className="section-title" style={{ marginBottom: "var(--space-5)" }}>Activity Timeline</h3>
            <div className="timeline">
              {timeline.map(({ icon, dotClass, event, meta, time }) => (
                <div className="timeline-item" key={event + time}>
                  <div className={`timeline-dot ${dotClass}`}>{icon}</div>
                  <div className="timeline-content">
                    <p className="timeline-event">{event}</p>
                    <p className="timeline-meta">{meta}</p>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
