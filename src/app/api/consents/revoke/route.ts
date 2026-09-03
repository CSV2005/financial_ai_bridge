import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { consents } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser("worker");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const { consentId } = await req.json();
    if (!consentId) {
      return NextResponse.json({ error: "Consent id is required." }, { status: 400 });
    }
    const updated = await db
      .update(consents)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(and(eq(consents.id, consentId), eq(consents.workerId, user.id)))
      .returning({ id: consents.id });
    if (updated.length === 0) {
      return NextResponse.json({ error: "Consent not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not revoke consent." }, { status: 500 });
  }
}
