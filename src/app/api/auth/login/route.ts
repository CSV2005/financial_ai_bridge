import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword, dashboardPath } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, String(email).trim().toLowerCase()))
      .limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true, redirect: dashboardPath(user.role) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}
