import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { incomeEntries, employerProfiles } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser("employer");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const { entryId, action } = await req.json();

    if (!entryId || !["confirm", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // The employer may only act on records addressed to them.
    const rows = await db
      .select()
      .from(incomeEntries)
      .where(and(eq(incomeEntries.id, entryId), eq(incomeEntries.employerUserId, user.id)))
      .limit(1);
    const entry = rows[0];
    if (!entry) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    if (entry.status !== "unverified") {
      return NextResponse.json({ error: "This record has already been processed." }, { status: 409 });
    }

    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, user.id))
      .limit(1);
    const company = profile?.companyName ?? user.name;

    if (action === "confirm") {
      await db
        .update(incomeEntries)
        .set({
          status: "verified",
          verificationMethod: "employer_confirmation",
          evidenceNote: `Confirmed by ${user.name} (${company}) on FinancialBridge.`,
          verifiedAt: new Date(),
        })
        .where(eq(incomeEntries.id, entryId));
    } else {
      await db
        .update(incomeEntries)
        .set({
          status: "rejected",
          evidenceNote: `Rejected by ${user.name} (${company}) — payment not recognised.`,
          verifiedAt: new Date(),
        })
        .where(eq(incomeEntries.id, entryId));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not process the verification." }, { status: 500 });
  }
}
