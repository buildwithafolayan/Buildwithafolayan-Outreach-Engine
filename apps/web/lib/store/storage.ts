import { getSupabaseClient } from "@/lib/supabase/client";

export interface Contact {
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

export interface SequenceStep {
  number: number;
  subject: string;
  bodyText: string;
  delayDays: number;
  delayDescription: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
  description: string;
  gmailAccount?: string;
  dailyLimit: number;
  hourlyLimit: number;
  steps: SequenceStep[];
  enrolledCount: number;
  sentCount: number;
  repliedCount: number;
  replyRate: string;
  createdAt: string;
  nextAction?: string;
}

export interface SystemSettings {
  globalSendingEnabled: boolean;
  testRecipient?: string;
  dailyLimit: number;
  hourlyLimit: number;
  failureThreshold: number;
  timeZone: string;
  sendWindowStart: string;
  sendWindowEnd: string;
  activeDays: string[];
  randomizedDelayMinutes: number;
  emailSignature?: string;
  adminEmail: string;
}

// ─────────────────────────────────────────────────────────────
// DB ↔ JS mappers
// ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SystemSettings = {
  globalSendingEnabled: false,
  testRecipient: "",
  dailyLimit: 20,
  hourlyLimit: 5,
  failureThreshold: 3,
  timeZone: "Africa/Lagos",
  sendWindowStart: "09:00",
  sendWindowEnd: "17:00",
  activeDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  randomizedDelayMinutes: 15,
  adminEmail: "you@example.com",
};

const DEFAULT_CONTACTS: Contact[] = [
  {
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
    notes: "VP of Engineering. Interested in developer tools.",
    tags: ["saas", "engineering-lead", "west-coast"],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActivity: "Replied 4 hours ago",
  },
  {
    id: "c2",
    firstName: "Marcus",
    lastName: "Williams",
    email: "marcus@growthly.com",
    company: "Growthly",
    website: "growthly.com",
    city: "New York",
    industry: "Marketing Tech",
    state: "ENROLLED",
    source: "CSV Import",
    notes: "Head of Growth.",
    tags: ["growth", "b2b"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActivity: "Enrolled in Q3 Outreach",
  },
  {
    id: "c3",
    firstName: "Aisha",
    lastName: "Okonkwo",
    email: "aisha@venturex.ng",
    company: "VentureX",
    website: "venturex.ng",
    city: "Lagos",
    industry: "Fintech",
    state: "READY",
    source: "Manual Entry",
    notes: "Managing Partner.",
    tags: ["fintech", "executive"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastActivity: "Imported yesterday",
  },
];

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "camp1",
    name: "Q3 Developer Outreach",
    status: "ACTIVE",
    description: "Targeted outreach to engineering leaders at mid-stage SaaS companies for our developer tools platform.",
    gmailAccount: "favour.afolayan.dev@gmail.com",
    dailyLimit: 20,
    hourlyLimit: 5,
    steps: [
      {
        number: 1,
        subject: "Helping {{company}} ship faster",
        bodyText: "Hi {{first_name}},\n\nI noticed {{company}} is scaling its engineering team. We built a platform that cuts developer pipeline latency by 40%.\n\nWould you be open to a quick 5-minute chat next Tuesday?\n\nBest,\nAfolayan",
        delayDays: 0,
        delayDescription: "Immediate",
      },
      {
        number: 2,
        subject: "Quick follow-up on developer tools",
        bodyText: "Hi {{first_name}},\n\nJust wanted to follow up on my previous note. Thought you might find our case studies relevant to {{company}}.\n\nBest,\nAfolayan",
        delayDays: 3,
        delayDescription: "3 days after Step 1",
      },
      {
        number: 3,
        subject: "Case study: How teams like {{company}} save 40% dev time",
        bodyText: "Hi {{first_name}},\n\nWanted to share a 2-minute breakdown of how similar engineering teams improved build times.\n\nBest,\nAfolayan",
        delayDays: 5,
        delayDescription: "5 days after Step 2",
      },
      {
        number: 4,
        subject: "Last note — happy to help when the timing is right",
        bodyText: "Hi {{first_name}},\n\nI know timing is everything. If you ever want to streamline {{company}}'s developer pipelines, feel free to reach out anytime.\n\nBest,\nAfolayan",
        delayDays: 7,
        delayDescription: "7 days after Step 3",
      },
    ],
    enrolledCount: 24,
    sentCount: 38,
    repliedCount: 6,
    replyRate: "15.8%",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    nextAction: "3 sends scheduled for tomorrow",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbContact(row: any): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name ?? "",
    email: row.email,
    company: row.company,
    website: row.website ?? undefined,
    city: row.city ?? undefined,
    industry: row.industry ?? undefined,
    state: row.state,
    source: row.source,
    notes: row.notes ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    lastActivity: row.last_activity ?? undefined,
  };
}

function toDbContact(c: Contact) {
  return {
    id: c.id,
    first_name: c.firstName,
    last_name: c.lastName ?? "",
    email: c.email,
    company: c.company,
    website: c.website ?? null,
    city: c.city ?? null,
    industry: c.industry ?? null,
    state: c.state,
    source: c.source,
    notes: c.notes ?? null,
    tags: c.tags,
    created_at: c.createdAt,
    last_activity: c.lastActivity ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Campaign["status"],
    description: row.description ?? "",
    gmailAccount: row.gmail_account ?? undefined,
    dailyLimit: row.daily_limit,
    hourlyLimit: row.hourly_limit,
    steps: Array.isArray(row.steps) ? row.steps : [],
    enrolledCount: row.enrolled_count,
    sentCount: row.sent_count,
    repliedCount: row.replied_count,
    replyRate: row.reply_rate,
    createdAt: row.created_at,
    nextAction: row.next_action ?? undefined,
  };
}

function toDbCampaign(c: Campaign) {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    description: c.description,
    gmail_account: c.gmailAccount ?? null,
    daily_limit: c.dailyLimit,
    hourly_limit: c.hourlyLimit,
    steps: c.steps,
    enrolled_count: c.enrolledCount,
    sent_count: c.sentCount,
    replied_count: c.repliedCount,
    reply_rate: c.replyRate,
    created_at: c.createdAt,
    next_action: c.nextAction ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromDbSettings(row: any): SystemSettings {
  return {
    globalSendingEnabled: row.global_sending_enabled ?? false,
    testRecipient: row.test_recipient ?? "",
    dailyLimit: row.daily_limit ?? 20,
    hourlyLimit: row.hourly_limit ?? 5,
    failureThreshold: row.failure_threshold ?? 3,
    timeZone: row.time_zone ?? "Africa/Lagos",
    sendWindowStart: row.send_window_start ?? "09:00",
    sendWindowEnd: row.send_window_end ?? "17:00",
    activeDays: Array.isArray(row.active_days) ? row.active_days : ["Mon", "Tue", "Wed", "Thu", "Fri"],
    randomizedDelayMinutes: row.randomized_delay_minutes ?? 15,
    emailSignature: row.email_signature ?? undefined,
    adminEmail: row.admin_email ?? "you@example.com",
  };
}

// ─────────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────────

export async function getStoredContacts(): Promise<Contact[]> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getStoredContacts error:", error.message);
    return DEFAULT_CONTACTS;
  }

  // First-run: seed defaults if table is empty
  if (!data || data.length === 0) {
    const { error: seedError } = await db
      .from("contacts")
      .upsert(DEFAULT_CONTACTS.map(toDbContact), { onConflict: "id" });
    if (seedError) console.error("Seed contacts error:", seedError.message);
    return DEFAULT_CONTACTS;
  }

  return data.map(fromDbContact);
}

export async function saveStoredContacts(contacts: Contact[]): Promise<void> {
  const db = getSupabaseClient();

  // Fetch existing IDs so we can delete rows removed from the list
  const { data: existing } = await db.from("contacts").select("id");
  const existingIds: string[] = (existing ?? []).map((r: { id: string }) => r.id);
  const newIds = contacts.map((c) => c.id);
  const toDelete = existingIds.filter((id) => !newIds.includes(id));

  if (contacts.length > 0) {
    const { error } = await db
      .from("contacts")
      .upsert(contacts.map(toDbContact), { onConflict: "id" });
    if (error) throw new Error(`Failed to save contacts: ${error.message}`);
  }

  if (toDelete.length > 0) {
    const { error } = await db.from("contacts").delete().in("id", toDelete);
    if (error) console.error("Failed to delete stale contacts:", error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Campaigns
// ─────────────────────────────────────────────────────────────

export async function getStoredCampaigns(): Promise<Campaign[]> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getStoredCampaigns error:", error.message);
    return DEFAULT_CAMPAIGNS;
  }

  // First-run: seed defaults if table is empty
  if (!data || data.length === 0) {
    const { error: seedError } = await db
      .from("campaigns")
      .upsert(DEFAULT_CAMPAIGNS.map(toDbCampaign), { onConflict: "id" });
    if (seedError) console.error("Seed campaigns error:", seedError.message);
    return DEFAULT_CAMPAIGNS;
  }

  return data.map(fromDbCampaign);
}

export async function saveStoredCampaigns(campaigns: Campaign[]): Promise<void> {
  const db = getSupabaseClient();

  const { data: existing } = await db.from("campaigns").select("id");
  const existingIds: string[] = (existing ?? []).map((r: { id: string }) => r.id);
  const newIds = campaigns.map((c) => c.id);
  const toDelete = existingIds.filter((id) => !newIds.includes(id));

  if (campaigns.length > 0) {
    const { error } = await db
      .from("campaigns")
      .upsert(campaigns.map(toDbCampaign), { onConflict: "id" });
    if (error) throw new Error(`Failed to save campaigns: ${error.message}`);
  }

  if (toDelete.length > 0) {
    const { error } = await db.from("campaigns").delete().in("id", toDelete);
    if (error) console.error("Failed to delete stale campaigns:", error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Settings (single row, id = 1, seeded by SQL schema)
// ─────────────────────────────────────────────────────────────

export async function getStoredSettings(): Promise<SystemSettings> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from("system_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Supabase getStoredSettings error:", error?.message);
    return DEFAULT_SETTINGS;
  }

  return fromDbSettings(data);
}

export async function saveStoredSettings(
  settings: Partial<SystemSettings>
): Promise<SystemSettings> {
  const db = getSupabaseClient();

  // Map camelCase keys to snake_case for only the keys provided
  const patch: Record<string, unknown> = {};
  if (settings.globalSendingEnabled !== undefined) patch.global_sending_enabled = settings.globalSendingEnabled;
  if (settings.testRecipient !== undefined) patch.test_recipient = settings.testRecipient;
  if (settings.dailyLimit !== undefined) patch.daily_limit = settings.dailyLimit;
  if (settings.hourlyLimit !== undefined) patch.hourly_limit = settings.hourlyLimit;
  if (settings.failureThreshold !== undefined) patch.failure_threshold = settings.failureThreshold;
  if (settings.timeZone !== undefined) patch.time_zone = settings.timeZone;
  if (settings.sendWindowStart !== undefined) patch.send_window_start = settings.sendWindowStart;
  if (settings.sendWindowEnd !== undefined) patch.send_window_end = settings.sendWindowEnd;
  if (settings.activeDays !== undefined) patch.active_days = settings.activeDays;
  if (settings.randomizedDelayMinutes !== undefined) patch.randomized_delay_minutes = settings.randomizedDelayMinutes;
  if (settings.emailSignature !== undefined) patch.email_signature = settings.emailSignature;
  if (settings.adminEmail !== undefined) patch.admin_email = settings.adminEmail;

  const { data, error } = await db
    .from("system_settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error || !data) {
    console.error("Supabase saveStoredSettings error:", error?.message);
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  return fromDbSettings(data);
}

