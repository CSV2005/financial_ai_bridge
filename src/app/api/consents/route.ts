import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { consents } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

/* Worker shares their financial profile with a partner bank. */
export async function POST(req: Request) {
  try {
    const user = await requireApiUser("worker");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const { bankName } = await req.json();
    if (!bankName || typeof bankName !== "string") {
      return NextResponse.json({ error: "Bank name is required." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(consents)
      .where(and(eq(consents.workerId, user.id), eq(consents.institutionName, bankName)))
      .limit(1);

    if (existing[0]?.status === "active") {
      return NextResponse.json({ ok: true, already: true });
    }
    if (existing[0]) {
      await db
        .update(consents)
        .set({ status: "active", grantedAt: new Date(), revokedAt: null })
        .where(eq(consents.id, existing[0].id));
      return NextResponse.json({ ok: true, reactivated: true });
    }

    await db.insert(consents).values({
      workerId: user.id,
      institutionName: bankName,
      institutionType: "partner_bank",
      scopes: "profile,score,income,savings",
      purpose:
        "Share your alternative financial profile for further assessment by the bank. The final lending decision always belongs to the bank.",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not record consent." }, { status: 500 });
  }
}
