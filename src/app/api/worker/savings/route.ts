import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { workerProfiles } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser("worker");
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const { amount } = await req.json();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || value > 10000000) {
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    }
    await db
      .update(workerProfiles)
      .set({ currentSavings: sql`${workerProfiles.currentSavings} + ${Math.round(value)}` })
      .where(eq(workerProfiles.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not record savings." }, { status: 500 });
  }
}
