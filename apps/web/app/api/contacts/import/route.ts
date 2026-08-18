import { NextRequest, NextResponse } from "next/server";
import { getStoredContacts, saveStoredContacts, Contact } from "@/lib/store/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No valid contact rows provided in CSV." },
        { status: 400 }
      );
    }

    const currentContacts = await getStoredContacts();
    const existingEmails = new Set(currentContacts.map((c) => c.email.toLowerCase()));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const addedContacts: Contact[] = [];
    let duplicatesSkipped = 0;
    let invalidSkipped = 0;

    for (const r of rows) {
      const email = (r.email || r.Email || "").toLowerCase().trim();
      const firstName = (r.firstName || r.first_name || r.FirstName || r["First Name"] || "").trim();
      const lastName = (r.lastName || r.last_name || r.LastName || r["Last Name"] || "").trim();
      const company = (r.company || r.Company || "").trim();
      const website = (r.website || r.Website || "").trim();
      const city = (r.city || r.City || "").trim();
      const industry = (r.industry || r.Industry || "").trim();
      const notes = (r.notes || r.Notes || r.title || r.Title || "").trim();

      if (!email || !emailRegex.test(email) || !firstName || !company) {
        invalidSkipped++;
        continue;
      }

      if (existingEmails.has(email)) {
        duplicatesSkipped++;
        continue;
      }

      existingEmails.add(email);
      const newContact: Contact = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        firstName,
        lastName,
        email,
        company,
        website,
        city,
        industry,
        state: "READY",
        source: "CSV Import",
        notes,
        tags: ["csv-import"],
        createdAt: new Date().toISOString(),
        lastActivity: "Imported from CSV",
      };

      addedContacts.push(newContact);
    }

    const updated = [...addedContacts, ...currentContacts];
    await saveStoredContacts(updated);

    return NextResponse.json({
      success: true,
      importedCount: addedContacts.length,
      duplicatesSkipped,
      invalidSkipped,
      totalContacts: updated.length,
    });
  } catch (error) {
    console.error("Bulk CSV import error:", error);
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 });
  }
}
