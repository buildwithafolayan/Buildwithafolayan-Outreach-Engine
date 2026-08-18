import { cookies } from "next/headers";

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

// Initial default seed data
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

const CONTACTS_COOKIE = "outreach_contacts_store";
const CAMPAIGNS_COOKIE = "outreach_campaigns_store";
const SETTINGS_COOKIE = "outreach_settings_store";

export async function getStoredContacts(): Promise<Contact[]> {
  const cookieStore = await cookies();
  const c = cookieStore.get(CONTACTS_COOKIE);
  if (!c?.value) return DEFAULT_CONTACTS;
  try {
    return JSON.parse(c.value);
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export async function saveStoredContacts(contacts: Contact[]) {
  const cookieStore = await cookies();
  cookieStore.set(CONTACTS_COOKIE, JSON.stringify(contacts), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getStoredCampaigns(): Promise<Campaign[]> {
  const cookieStore = await cookies();
  const c = cookieStore.get(CAMPAIGNS_COOKIE);
  if (!c?.value) return DEFAULT_CAMPAIGNS;
  try {
    return JSON.parse(c.value);
  } catch {
    return DEFAULT_CAMPAIGNS;
  }
}

export async function saveStoredCampaigns(campaigns: Campaign[]) {
  const cookieStore = await cookies();
  cookieStore.set(CAMPAIGNS_COOKIE, JSON.stringify(campaigns), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getStoredSettings(): Promise<SystemSettings> {
  const cookieStore = await cookies();
  const c = cookieStore.get(SETTINGS_COOKIE);
  if (!c?.value) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(c.value) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoredSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getStoredSettings();
  const updated = { ...current, ...settings };
  const cookieStore = await cookies();
  cookieStore.set(SETTINGS_COOKIE, JSON.stringify(updated), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return updated;
}
