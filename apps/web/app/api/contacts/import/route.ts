import { NextRequest, NextResponse } from "next/server";
import { getStoredContacts, saveStoredContacts, Contact } from "@/lib/store/storage";

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findFieldValue(row: Record<string, string>, possibleKeys: string[]): string {
  const normPossible = possibleKeys.map(normalizeKey);
  for (const [key, val] of Object.entries(row)) {
    const normKey = normalizeKey(key);
    if (normPossible.includes(normKey) && val && typeof val === "string" && val.trim().length > 0) {
      return val.trim();
    }
  }
  return "";
}

function extractCompanyFromEmail(email: string): string {
  try {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const namePart = domain.split(".")[0];
    const generic = ["gmail", "yahoo", "hotmail", "outlook", "icloud", "aol", "proton", "protonmail", "mail"];
    if (generic.includes(namePart) || !namePart) {
      return "Independent Target";
    }
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  } catch {
    return "Independent Target";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, customMappings } = body as {
      rows: Array<Record<string, string>>;
      customMappings?: Record<string, string>;
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No valid contact rows provided in CSV." },
        { status: 400 }
      );
    }

    const currentContacts = await getStoredContacts();
    const existingEmails = new Set(currentContacts.map((c) => c.email.toLowerCase().trim()));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const addedContacts: Contact[] = [];
    let duplicatesSkipped = 0;
    let invalidSkipped = 0;

    for (const r of rows) {
      // 1. Resolve Email
      let email = customMappings?.email ? (r[customMappings.email] || "") : "";
      if (!email) {
        email = findFieldValue(r, [
          "email",
          "emailaddress",
          "workemail",
          "contactemail",
          "primaryemail",
          "email1",
          "mail",
        ]);
      }
      email = email.toLowerCase().trim();

      // If email has mailto: or quotes
      email = email.replace(/^mailto:/i, "").replace(/["']/g, "").trim();

      if (!email || !emailRegex.test(email)) {
        invalidSkipped++;
        continue;
      }

      if (existingEmails.has(email)) {
        duplicatesSkipped++;
        continue;
      }

      // 2. Resolve Name
      let firstName = customMappings?.firstName ? (r[customMappings.firstName] || "") : "";
      let lastName = customMappings?.lastName ? (r[customMappings.lastName] || "") : "";

      if (!firstName) {
        firstName = findFieldValue(r, [
          "firstname",
          "first",
          "givenname",
          "fname",
          "contactfirstname",
        ]);
      }

      if (!lastName) {
        lastName = findFieldValue(r, [
          "lastname",
          "last",
          "surname",
          "familyname",
          "lname",
          "contactlastname",
        ]);
      }

      // If firstName is still missing, try Full Name / Name
      if (!firstName) {
        const fullName = findFieldValue(r, [
          "fullname",
          "name",
          "contactname",
          "leadname",
          "prospectname",
          "person",
        ]);

        if (fullName) {
          const parts = fullName.trim().split(/\s+/);
          firstName = parts[0] || "";
          if (parts.length > 1 && !lastName) {
            lastName = parts.slice(1).join(" ");
          }
        }
      }

      // Fallback first name if completely absent
      if (!firstName) {
        firstName = email.split("@")[0].split(/[._-]/)[0] || "Prospect";
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }

      // 3. Resolve Company
      let company = customMappings?.company ? (r[customMappings.company] || "") : "";
      if (!company) {
        company = findFieldValue(r, [
          "company",
          "companyname",
          "organization",
          "org",
          "account",
          "businessname",
          "employer",
          "firm",
          "investmentbackground",
          "brokerage",
        ]);
      }
      if (!company) {
        company = extractCompanyFromEmail(email);
      }

      // 4. Resolve Website / LinkedIn
      let website = customMappings?.website ? (r[customMappings.website] || "") : "";
      if (!website) {
        website = findFieldValue(r, [
          "website",
          "companywebsite",
          "url",
          "domain",
          "linkedin",
          "linkedinurl",
          "profileurl",
        ]);
      }

      // 5. Resolve Location / City
      let city = customMappings?.city ? (r[customMappings.city] || "") : "";
      if (!city) {
        city = findFieldValue(r, [
          "city",
          "state",
          "citystate",
          "location",
          "address",
          "region",
          "metro",
        ]);
      }

      // 6. Resolve Industry
      let industry = customMappings?.industry ? (r[customMappings.industry] || "") : "";
      if (!industry) {
        industry = findFieldValue(r, [
          "industry",
          "sector",
          "category",
          "niche",
          "vertical",
          "leadsource",
          "networthtier",
        ]);
      }
      if (!industry) {
        industry = "B2B Outreach Target";
      }

      // 7. Aggregate Sourcing Notes & Extra Fields
      const noteFields: string[] = [];
      for (const [k, v] of Object.entries(r)) {
        if (!v || typeof v !== "string" || !v.trim()) continue;
        const norm = normalizeKey(k);
        // Exclude standard fields already captured
        if (
          [
            "email",
            "emailaddress",
            "firstname",
            "lastname",
            "fullname",
            "name",
            "company",
            "companyname",
          ].includes(norm)
        ) {
          continue;
        }
        noteFields.push(`${k}: ${v.trim()}`);
      }
      const notes = noteFields.slice(0, 5).join(" | ");

      existingEmails.add(email);
      const newContact: Contact = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        company: company.trim(),
        website: website.trim(),
        city: city.trim(),
        industry: industry.trim(),
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
      sampleAdded: addedContacts.slice(0, 3).map((c) => ({
        name: `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        company: c.company,
      })),
    });
  } catch (error) {
    console.error("Bulk CSV import error:", error);
    return NextResponse.json({ error: "Failed to process CSV import" }, { status: 500 });
  }
}
