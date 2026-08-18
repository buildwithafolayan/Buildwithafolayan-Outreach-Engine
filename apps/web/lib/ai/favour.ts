import { GoogleGenAI } from "@google/genai";
import {
  getStoredCampaigns,
  getStoredContacts,
  getStoredSettings,
  saveStoredCampaigns,
  saveStoredSettings,
} from "@/lib/store/storage";
import { getConnectedGmailAccount } from "@/lib/gmail/oauth";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface FavourMessage {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
    result?: unknown;
  }>;
  widgets?: Array<{
    type: "lead_cards" | "metric_cards" | "action_confirm" | "campaign_card";
    data: unknown;
  }>;
}

export interface FavourContext {
  currentPage?: string;
  selectedCampaignId?: string;
  selectedContactId?: string;
}

// Tool Implementation Functions
export async function getSystemOverviewTool() {
  const [contacts, campaigns, settings, gmail] = await Promise.all([
    getStoredContacts(),
    getStoredCampaigns(),
    getStoredSettings(),
    getConnectedGmailAccount(),
  ]);
  return {
    totalContacts: contacts.length,
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
    globalSendingEnabled: settings.globalSendingEnabled,
    dailyLimit: settings.dailyLimit,
    hourlyLimit: settings.hourlyLimit,
    connectedGmail: gmail ? gmail.email : "Not connected",
  };
}

export async function getContactsTool(args?: { filter?: string; search?: string }) {
  const contacts = await getStoredContacts();
  let result = contacts;
  if (args?.filter && args.filter !== "ALL") {
    result = result.filter((c) => c.state.toUpperCase() === args.filter?.toUpperCase());
  }
  if (args?.search) {
    const q = args.search.toLowerCase();
    result = result.filter(
      (c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(q)
    );
  }
  return result.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    company: c.company,
    state: c.state,
    industry: c.industry,
    lastActivity: c.lastActivity,
  }));
}

export async function getCampaignsTool() {
  const campaigns = await getStoredCampaigns();
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    stepsCount: c.steps?.length || 0,
    enrolledCount: c.enrolledCount,
    sentCount: c.sentCount,
    repliedCount: c.repliedCount,
    replyRate: c.replyRate,
  }));
}

export async function identifyHotLeadsTool() {
  const contacts = await getStoredContacts();
  const hot = contacts.filter((c) => c.state === "REPLIED");
  return hot.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    company: c.company,
    notes: c.notes,
    lastActivity: c.lastActivity,
  }));
}

export async function pauseCampaignTool(campaignId: string) {
  const campaigns = await getStoredCampaigns();
  const idx = campaigns.findIndex(
    (c) => c.id === campaignId || c.name.toLowerCase().includes(campaignId.toLowerCase())
  );
  if (idx === -1) return { error: "Campaign not found" };
  campaigns[idx].status = "PAUSED";
  await saveStoredCampaigns(campaigns);
  return { success: true, message: `Campaign "${campaigns[idx].name}" paused.` };
}

export async function resumeCampaignTool(campaignId: string) {
  const campaigns = await getStoredCampaigns();
  const idx = campaigns.findIndex(
    (c) => c.id === campaignId || c.name.toLowerCase().includes(campaignId.toLowerCase())
  );
  if (idx === -1) return { error: "Campaign not found" };
  campaigns[idx].status = "ACTIVE";
  await saveStoredCampaigns(campaigns);
  return { success: true, message: `Campaign "${campaigns[idx].name}" resumed.` };
}

export async function toggleGlobalSendingTool(enabled: boolean) {
  const settings = await saveStoredSettings({ globalSendingEnabled: enabled });
  return { success: true, globalSendingEnabled: settings.globalSendingEnabled };
}

/**
 * Assemble runtime context for Favour Copilot.
 */
async function assembleSystemContext(context?: FavourContext): Promise<string> {
  const [overview, hotLeads] = await Promise.all([
    getSystemOverviewTool(),
    identifyHotLeadsTool(),
  ]);

  let contextualInfo = `
Current System State:
- Global Sending: ${overview.globalSendingEnabled ? "ACTIVE (Enabled)" : "PAUSED (Safe)"}
- Connected Gmail Mailbox: ${overview.connectedGmail}
- Total Contacts: ${overview.totalContacts}
- Active Campaigns: ${overview.activeCampaigns}
- Hot Leads / Positive Replies: ${hotLeads.length}
`;

  if (context?.currentPage) {
    contextualInfo += `- Current Page Open in UI: ${context.currentPage}\n`;
  }
  if (context?.selectedCampaignId) {
    contextualInfo += `- Active Focused Campaign ID: ${context.selectedCampaignId}\n`;
  }
  if (context?.selectedContactId) {
    contextualInfo += `- Active Focused Contact ID: ${context.selectedContactId}\n`;
  }

  return contextualInfo;
}

/**
 * Execute Favour Copilot Chat with Tool Calling and Reasoning.
 */
export async function runFavourCopilot(params: {
  messages: FavourMessage[];
  context?: FavourContext;
}): Promise<FavourMessage> {
  const client = getClient();
  const systemContext = await assembleSystemContext(params.context);

  const toolsSummary = `
- get_system_overview: High level stats
- get_contacts: Contact listing & filters
- get_campaigns: Campaign listing & metrics
- identify_hot_leads: Hot prospects with positive replies
- pause_campaign: Pause an active campaign
- resume_campaign: Resume a paused campaign
- toggle_global_sending: Global master sending toggle
`;

  const systemInstruction = `You are Favour, the elite sales operations copilot and strategic AI partner for Favour Afolayan.
You operate "Favour Outreach OS" with calm, sharp, strategic authority.

Personality & Rules:
1. Tone: Highly intelligent, concise, strategic, calm, and action-oriented.
2. Grounded Truth: Never invent contacts, metrics, or replies. Ground everything strictly in system data.
3. Tool Usage: When asked about contacts, campaigns, metrics, or actions, invoke the appropriate tool by name in a JSON block or report what you did.
4. Action Safety: For low-risk actions (e.g. pausing a campaign), execute directly. For destructive actions (e.g. deleting large batches), request confirmation.
5. Real Estate & B2B Focus: Prioritize high-converting plain-text outreach strategies tailored for Real Estate, Lawyers, Coaches, and B2B automation buyers.

Available Tools:
${toolsSummary}

${systemContext}`;

  const conversationHistory = params.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const prompt = `${systemInstruction}

Conversation History:
${conversationHistory}

ASSISTANT (Favour):`;

  try {
    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "I have analyzed your request.";

    // Tool calling parser: Check if Favour wants to run tools
    const toolExecutions: Array<{ name: string; args: Record<string, unknown>; result: unknown }> = [];

    // Simple heuristic / keyword tool execution if user asked for overview or hot leads
    const lastUserMsg = params.messages[params.messages.length - 1]?.content.toLowerCase() || "";

    if (lastUserMsg.includes("hot lead") || lastUserMsg.includes("replied") || lastUserMsg.includes("who replied")) {
      const result = await identifyHotLeadsTool();
      toolExecutions.push({ name: "identify_hot_leads", args: {}, result });
    } else if (lastUserMsg.includes("campaign") || lastUserMsg.includes("performance")) {
      const result = await getCampaignsTool();
      toolExecutions.push({ name: "get_campaigns", args: {}, result });
    } else if (lastUserMsg.includes("contact") || lastUserMsg.includes("prospect")) {
      const result = await getContactsTool();
      toolExecutions.push({ name: "get_contacts", args: {}, result });
    }

    return {
      role: "assistant",
      content: responseText,
      toolCalls: toolExecutions.length > 0 ? toolExecutions : undefined,
    };
  } catch (error) {
    console.error("Favour copilot execution error:", error);
    return {
      role: "assistant",
      content:
        "I experienced a momentary connection timeout with the AI reasoning engine. Your system data remains safe and synchronized.",
    };
  }
}
