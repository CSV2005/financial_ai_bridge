import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  workerProfiles,
  employerProfiles,
  bankProfiles,
} from "@/db/schema";
import { createSession, hashPassword, dashboardPath } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, name, email, password } = body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (!["worker", "employer", "bank"].includes(role)) {
      return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const [user] = await db
      .insert(users)
      .values({
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        name: name.trim(),
        role,
      })
      .returning();

    if (role === "worker") {
      await db.insert(workerProfiles).values({
        userId: user.id,
        workerType: body.workerType || "gig",
        city: body.city?.trim() || null,
        primaryPlatform: body.primaryPlatform?.trim() || null,
        workStartDate: body.workStartDate || null,
        onboardingComplete: !!(body.workerType && body.city),
      });
    } else if (role === "employer") {
      if (!body.companyName?.trim()) {
        return NextResponse.json({ error: "Company name is required." }, { status: 400 });
      }
      await db.insert(employerProfiles).values({
        userId: user.id,
        companyName: body.companyName.trim(),
        industry: body.industry?.trim() || null,
      });
    } else {
      if (!body.bankName?.trim()) {
        return NextResponse.json({ error: "Bank name is required." }, { status: 400 });
      }
      await db.insert(bankProfiles).values({
        userId: user.id,
        bankName: body.bankName.trim(),
      });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, redirect: dashboardPath(role) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
