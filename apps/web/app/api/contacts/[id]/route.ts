import { NextRequest, NextResponse } from "next/server";
import { getStoredContacts, saveStoredContacts } from "@/lib/store/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contacts = await getStoredContacts();
    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Failed to fetch contact:", error);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const contacts = await getStoredContacts();
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updatedContact = {
      ...contacts[index],
      ...body,
      id: contacts[index].id, // Prevent overwriting ID
    };

    contacts[index] = updatedContact;
    await saveStoredContacts(contacts);

    return NextResponse.json({ success: true, contact: updatedContact });
  } catch (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contacts = await getStoredContacts();
    const filtered = contacts.filter((c) => c.id !== id);

    if (filtered.length === contacts.length) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await saveStoredContacts(filtered);
    return NextResponse.json({ success: true, message: "Contact deleted" });
  } catch (error) {
    console.error("Failed to delete contact:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
