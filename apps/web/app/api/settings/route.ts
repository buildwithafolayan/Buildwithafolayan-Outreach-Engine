import { NextRequest, NextResponse } from "next/server";
import { getStoredSettings, saveStoredSettings } from "@/lib/store/storage";

export async function GET() {
  try {
    const settings = await getStoredSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveStoredSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
