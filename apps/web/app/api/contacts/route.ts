import { NextRequest, NextResponse } from "next/server";
import { getStoredContacts, saveStoredContacts, Contact } from "@/lib/store/storage";

export async function GET() {
  try {
    const contacts = await getStoredContacts();
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Failed to load contacts:", error);
    return NextResponse.json({ error: "Failed to load contacts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, company, website, city, industry, notes, tags } = body;

    if (!email || !firstName || !company) {
      return NextResponse.json(
        { error: "First name, email, and company are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const contacts = await getStoredContacts();

    // Check duplicate
    const existing = contacts.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { error: `A contact with email ${email} already exists.` },
        { status: 409 }
      );
    }

    const newContact: Contact = {
      id: `c_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      website: (website || "").trim(),
      city: (city || "").trim(),
      industry: (industry || "").trim(),
      state: "READY",
      source: "Manual Entry",
      notes: (notes || "").trim(),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      lastActivity: "Added just now",
    };

    const updated = [newContact, ...contacts];
    await saveStoredContacts(updated);

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Failed to create contact:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create contact" },
      { status: 500 }
    );
  }
}
