import { NextResponse } from "next/server";
import { db } from "@/db";
import { incomeEntries } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser("worker");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const body = await req.json();
    const { date, source, description, channel, employerId } = body as Record<string, string | null>;
    const amount = Number(body.amount);

    if (!date || !source?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Date, payer and work description are required." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    }

    await db.insert(incomeEntries).values({
      workerId: user.id,
      employerUserId: employerId || null,
      date,
      source: source.trim(),
      description: description.trim(),
      amount: Math.round(amount),
      channel: channel === "digital" ? "digital" : "cash",
      // Self-reported income is NEVER auto-verified.
      status: "unverified",
      evidenceNote: employerId
        ? "Self-reported. Verification request sent to the linked employer."
        : "Self-reported. Awaiting supporting evidence.",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save the income record." }, { status: 500 });
  }
}
