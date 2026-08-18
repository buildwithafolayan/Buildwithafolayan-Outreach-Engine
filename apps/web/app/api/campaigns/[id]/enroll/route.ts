import { NextRequest, NextResponse } from "next/server";
import { getStoredCampaigns, saveStoredCampaigns, getStoredContacts, saveStoredContacts } from "@/lib/store/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { contactIds } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "No contacts selected for enrollment." },
        { status: 400 }
      );
    }

    const campaigns = await getStoredCampaigns();
    const campaignIndex = campaigns.findIndex((c) => c.id === id);
    if (campaignIndex === -1) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Update contacts state to ENROLLED
    const contacts = await getStoredContacts();
    const enrolledIdSet = new Set(contactIds);

    const updatedContacts = contacts.map((c) => {
      if (enrolledIdSet.has(c.id)) {
        return {
          ...c,
          state: "ENROLLED",
          lastActivity: `Enrolled in ${campaigns[campaignIndex].name}`,
        };
      }
      return c;
    });

    await saveStoredContacts(updatedContacts);

    // Update campaign enrolled count
    campaigns[campaignIndex].enrolledCount += contactIds.length;
    campaigns[campaignIndex].status = "ACTIVE";
    campaigns[campaignIndex].nextAction = `${contactIds.length} sends queued for Step 1`;

    await saveStoredCampaigns(campaigns);

    return NextResponse.json({
      success: true,
      enrolledCount: contactIds.length,
      campaign: campaigns[campaignIndex],
    });
  } catch (error) {
    console.error("Failed to enroll contacts:", error);
    return NextResponse.json({ error: "Failed to enroll contacts" }, { status: 500 });
  }
}
