import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, workerProfiles, employerProfiles, bankProfiles } from "@/db/schema";
import { requireApiUser, UNAUTHORIZED } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
    const body = (await req.json()) as Record<string, string>;

    if (body.name?.trim()) {
      await db.update(users).set({ name: body.name.trim() }).where(eq(users.id, user.id));
    }

    if (user.role === "worker") {
      await db
        .update(workerProfiles)
        .set({
          workerType: body.workerType || undefined,
          city: body.city ?? undefined,
          primaryPlatform: body.primaryPlatform ?? undefined,
          workStartDate: body.workStartDate || undefined,
          phone: body.phone ?? undefined,
          onboardingComplete: true,
        })
        .where(eq(workerProfiles.userId, user.id));
    } else if (user.role === "employer") {
      await db
        .update(employerProfiles)
        .set({
          companyName: body.companyName || undefined,
          industry: body.industry ?? undefined,
        })
        .where(eq(employerProfiles.userId, user.id));
    } else if (user.role === "bank") {
      await db
        .update(bankProfiles)
        .set({ bankName: body.bankName || undefined })
        .where(eq(bankProfiles.userId, user.id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
