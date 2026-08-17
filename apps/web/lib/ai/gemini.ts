import { GoogleGenAI } from "@google/genai";

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

export type ReplyClassificationType =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "UNSUBSCRIBE"
  | "OUT_OF_OFFICE"
  | "UNCLEAR";

export interface ReplyClassificationResult {
  classification: ReplyClassificationType;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
  sentiment: "positive" | "negative" | "neutral";
}

/**
 * Classify an incoming email reply using Gemini Flash.
 * Determines intent (positive, negative, unsubscribe, out of office) and suggested next steps.
 */
export async function classifyReplyWithGemini(params: {
  emailBody: string;
  subject?: string;
  senderName?: string;
  companyName?: string;
  campaignContext?: string;
}): Promise<ReplyClassificationResult> {
  const client = getClient();

  const prompt = `You are an expert sales outreach AI assistant. Analyze this incoming email reply to a cold B2B outreach campaign.

Context:
${params.campaignContext ? `- Campaign context: ${params.campaignContext}` : ""}
${params.senderName ? `- Sender Name: ${params.senderName}` : ""}
${params.companyName ? `- Company: ${params.companyName}` : ""}
${params.subject ? `- Subject: ${params.subject}` : ""}

Incoming Email Content:
"""
${params.emailBody}
"""

Classify this email into ONE of the following categories:
- POSITIVE: Shows interest, asks questions, requests demo/call, asks for pricing, or forwards to decision maker.
- NEGATIVE: Explicitly not interested, bad fit, timing is wrong with no desire to reconnect.
- NEUTRAL: Acknowledges receipt without commitment, asking general info, or ambiguous.
- UNSUBSCRIBE: Requests removal, "stop emailing me", unsubscribe, GDPR/opt-out request.
- OUT_OF_OFFICE: Automated vacation/auto-responder message, returned on date X.
- UNCLEAR: Cannot be determined with high confidence or requires human review.

Return ONLY a valid JSON object matching this exact schema:
{
  "classification": "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNSUBSCRIBE" | "OUT_OF_OFFICE" | "UNCLEAR",
  "confidence": 0.95,
  "reasoning": "Brief 1-2 sentence explanation of why this classification was chosen.",
  "suggestedAction": "Recommended next step for the sales operator.",
  "sentiment": "positive" | "negative" | "neutral"
}`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text) as ReplyClassificationResult;
    return parsed;
  } catch (error) {
    console.error("Gemini reply classification error:", error);
    // Fallback safe classification
    return {
      classification: "UNCLEAR",
      confidence: 0.0,
      reasoning: "AI analysis encountered an error or connection timeout; manual review recommended.",
      suggestedAction: "Review reply manually.",
      sentiment: "neutral",
    };
  }
}

export interface PersonalizedEmailResult {
  personalizedSubject: string;
  personalizedBody: string;
  customHook: string;
  reasoning: string;
}

/**
 * Personalize an outreach email template for a specific prospect using Gemini Flash.
 */
export async function personalizeEmailWithGemini(params: {
  contact: {
    firstName: string;
    lastName: string;
    company: string;
    website?: string;
    industry?: string;
    city?: string;
    notes?: string;
  };
  templateSubject: string;
  templateBody: string;
  valueProposition?: string;
}): Promise<PersonalizedEmailResult> {
  const client = getClient();

  const prompt = `You are an elite B2B sales copywriter specializing in high-converting, concise plain-text cold emails.

Recipient Profile:
- Name: ${params.contact.firstName} ${params.contact.lastName}
- Company: ${params.contact.company}
${params.contact.industry ? `- Industry: ${params.contact.industry}` : ""}
${params.contact.city ? `- Location: ${params.contact.city}` : ""}
${params.contact.website ? `- Website: ${params.contact.website}` : ""}
${params.contact.notes ? `- Prospect Notes / Context: ${params.contact.notes}` : ""}

Base Template Subject:
"""
${params.templateSubject}
"""

Base Template Body:
"""
${params.templateBody}
"""

${params.valueProposition ? `Core Value Proposition / Product Context:\n${params.valueProposition}\n` : ""}

Instructions:
1. Generate an authentic, tailored, non-salesy plain-text email for this specific recipient.
2. Maintain natural phrasing, concise paragraphs, and clear low-friction call-to-action.
3. Replace any template variables like {{first_name}}, {{company}} accurately with proper contextualization.
4. Add a specific relevant hook or observation based on their company/industry.

Return ONLY a valid JSON object matching this schema:
{
  "personalizedSubject": "Crafted subject line",
  "personalizedBody": "Full plain text email body ready to send",
  "customHook": "Brief explanation of the tailored hook used",
  "reasoning": "Why this angle resonates with this prospect"
}`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as PersonalizedEmailResult;
  } catch (error) {
    console.error("Gemini email personalization error:", error);
    // Simple deterministic variable replacement as fallback
    const fallbackSubject = params.templateSubject
      .replace(/{{first_name}}/g, params.contact.firstName)
      .replace(/{{company}}/g, params.contact.company);
    const fallbackBody = params.templateBody
      .replace(/{{first_name}}/g, params.contact.firstName)
      .replace(/{{company}}/g, params.contact.company);

    return {
      personalizedSubject: fallbackSubject,
      personalizedBody: fallbackBody,
      customHook: "Standard template variable substitution (fallback)",
      reasoning: "AI service fallback applied.",
    };
  }
}

export interface GeneratedSequenceStep {
  stepNumber: number;
  delayDays: number;
  delayDescription: string;
  subjectTemplate: string;
  bodyTemplate: string;
  rationale: string;
}

/**
 * Generate a multi-step cold outreach sequence using Gemini Flash.
 */
export async function generateSequenceWithGemini(params: {
  campaignName: string;
  targetAudience: string;
  productDescription: string;
  numSteps?: number;
}): Promise<GeneratedSequenceStep[]> {
  const client = getClient();
  const numSteps = params.numSteps || 4;

  const prompt = `You are a cold email master strategist. Create an effective ${numSteps}-step B2B cold email sequence.

Campaign: ${params.campaignName}
Target Audience: ${params.targetAudience}
Product / Offer: ${params.productDescription}

Rules for the sequence:
- Step 1: Zero delay (Immediate). Strong personalized hook, pain point, clear value proposition, low friction CTA.
- Step 2: Follow-up (3-4 days). Adds value, gives a quick case study or statistic.
- Step 3: Follow-up (4-5 days). Different angle or social proof.
- Step 4: Breakup email (5-7 days). Professional, polite, leaves the door open.
- Use plain text templates with standard placeholders: {{first_name}}, {{company}}, {{industry}}.
- Ensure subjects for steps 2+ can thread properly with "Re: {{subject}}" or follow-up style.

Return ONLY a valid JSON array matching this schema:
[
  {
    "stepNumber": 1,
    "delayDays": 0,
    "delayDescription": "Immediate",
    "subjectTemplate": "Helping {{company}} ship faster",
    "bodyTemplate": "Hi {{first_name}},\\n\\nI noticed...",
    "rationale": "Why this step is structured this way"
  }
]`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    return JSON.parse(text) as GeneratedSequenceStep[];
  } catch (error) {
    console.error("Gemini sequence generation error:", error);
    return [];
  }
}
