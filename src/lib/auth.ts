import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

const SESSION_COOKIE = "fb_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function requireUser(role?: "worker" | "employer" | "bank") {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) {
    redirect(`/${user.role === "worker" ? "" : user.role + "/"}dashboard`);
  }
  return user;
}

/** For API route handlers — returns null instead of redirecting. */
export async function requireApiUser(role?: "worker" | "employer" | "bank") {
  const user = await getSessionUser();
  if (!user || (role && user.role !== role)) return null;
  return user;
}

export const UNAUTHORIZED = { error: "Unauthorized" };

export function dashboardPath(role: string) {
  if (role === "employer") return "/employer/dashboard";
  if (role === "bank") return "/bank/dashboard";
  return "/dashboard";
}
