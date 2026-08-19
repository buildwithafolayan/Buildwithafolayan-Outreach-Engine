import { NextRequest, NextResponse } from "next/server";
import { getStoredCampaigns, saveStoredCampaigns } from "@/lib/store/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaigns = await getStoredCampaigns();
    const campaign = campaigns.find((c) => c.id === id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const campaigns = await getStoredCampaigns();
    const index = campaigns.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updatedCampaign = {
      ...campaigns[index],
      ...body,
    };

    campaigns[index] = updatedCampaign;
    await saveStoredCampaigns(campaigns);

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaigns = await getStoredCampaigns();
    const filtered = campaigns.filter((c) => c.id !== id);

    if (filtered.length === campaigns.length) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await saveStoredCampaigns(filtered);
    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
