import { NextRequest, NextResponse } from "next/server";
import { getStoredCampaigns, saveStoredCampaigns, Campaign } from "@/lib/store/storage";
import { getConnectedGmailAccount } from "@/lib/gmail/oauth";

export async function GET() {
  try {
    const campaigns = await getStoredCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, dailyLimit, hourlyLimit, steps } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }

    const account = await getConnectedGmailAccount();
    const campaigns = await getStoredCampaigns();

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: name.trim(),
      status: "DRAFT",
      description: description || "Targeted B2B outreach sequence",
      gmailAccount: account?.email || "favour.afolayan.dev@gmail.com",
      dailyLimit: Number(dailyLimit) || 20,
      hourlyLimit: Number(hourlyLimit) || 5,
      steps: Array.isArray(steps) && steps.length > 0 ? steps : [
        {
          number: 1,
          subject: "Helping {{company}} scale faster",
          bodyText: "Hi {{first_name}},\n\nWanted to reach out regarding {{company}}...",
          delayDays: 0,
          delayDescription: "Immediate",
        },
      ],
      enrolledCount: 0,
      sentCount: 0,
      repliedCount: 0,
      replyRate: "—",
      createdAt: new Date().toISOString(),
      nextAction: "Draft — add contacts to launch",
    };

    const updated = [newCampaign, ...campaigns];
    await saveStoredCampaigns(updated);

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
