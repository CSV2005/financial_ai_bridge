import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { transactions, consents } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";
import { DEMO_INSTITUTIONS, generateDemoTransactions } from "@/lib/demo-data";

/*
 * HACKATHON DEMO ONLY.
 * Simulates a consent-based financial-data connection against mock
 * institutions. No real bank APIs, passwords, PINs or OTPs are involved.
 */
export async function POST(req: Request) {
  try {
    const user = await requireApiUser("worker");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const { institutionId, scopes } = await req.json();

    const institution = DEMO_INSTITUTIONS.find((i) => i.id === institutionId);
    if (!institution) {
      return NextResponse.json({ error: "Unknown demo institution." }, { status: 400 });
    }
    if (!Array.isArray(scopes) || scopes.length === 0) {
      return NextResponse.json({ error: "Select at least one data type to share." }, { status: 400 });
    }

    // Avoid double-importing for the same institution.
    const existingTx = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(and(eq(transactions.workerId, user.id), eq(transactions.institution, institution.name)))
      .limit(1);

    let imported = 0;
    if (existingTx.length === 0 && scopes.includes("transactions")) {
      const seedKey = Math.abs(
        Array.from(user.id).reduce((a, c) => a + c.charCodeAt(0), 0)
      );
      const generated = generateDemoTransactions(seedKey % 97);
      await db.insert(transactions).values(
        generated.map((t) => ({ ...t, workerId: user.id, institution: institution.name }))
      );
      imported = generated.length;
    }

    // Record (or reactivate) the consent.
    const existingConsent = await db
      .select()
      .from(consents)
      .where(and(eq(consents.workerId, user.id), eq(consents.institutionName, institution.name)))
      .limit(1);

    if (existingConsent[0]) {
      await db
        .update(consents)
        .set({
          status: "active",
          revokedAt: null,
          grantedAt: new Date(),
          scopes: scopes.join(","),
        })
        .where(eq(consents.id, existingConsent[0].id));
    } else {
      await db.insert(consents).values({
        workerId: user.id,
        institutionName: institution.name,
        institutionType: "data_provider",
        scopes: scopes.join(","),
        purpose: "Import transaction history to build your financial profile (demo connection).",
      });
    }

    return NextResponse.json({ ok: true, imported });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not complete the demo connection." }, { status: 500 });
  }
}
