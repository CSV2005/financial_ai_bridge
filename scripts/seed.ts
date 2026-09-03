/* ------------------------------------------------------------------ */
/*  FinancialBridge demo seed                                          */
/*  Run: npx tsx scripts/seed.ts                                       */
/*  Idempotent: skips if the main demo worker already exists.          */
/* ------------------------------------------------------------------ */

import "dotenv/config";
import { db } from "../src/db";
import {
  users,
  workerProfiles,
  employerProfiles,
  bankProfiles,
  workHistory,
  incomeEntries,
  transactions,
  repayments,
  consents,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { generateDemoTransactions } from "../src/lib/demo-data";
import { eq } from "drizzle-orm";

const DEMO_PASSWORD = "demo123";

function monthsAgoISO(months: number, day = 1): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - months);
  d.setDate(Math.min(day, 28));
  return d.toISOString().slice(0, 10);
}

async function main() {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "ravi@demo.com"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Demo data already seeded — skipping.");
    return;
  }

  console.log("Seeding FinancialBridge demo data...");

  const pw = hashPassword(DEMO_PASSWORD);

  /* ---------------- Users ---------------- */
  const [ravi] = await db
    .insert(users)
    .values({ email: "ravi@demo.com", passwordHash: pw, name: "Ravi Kumar", role: "worker" })
    .returning();

  const [meena] = await db
    .insert(users)
    .values({ email: "meena@demo.com", passwordHash: pw, name: "Meena Devi", role: "worker" })
    .returning();

  const [employer] = await db
    .insert(users)
    .values({ email: "employer@demo.com", passwordHash: pw, name: "Suresh Patel", role: "employer" })
    .returning();

  const [bank] = await db
    .insert(users)
    .values({ email: "bank@demo.com", passwordHash: pw, name: "Anita Rao", role: "bank" })
    .returning();

  /* ---------------- Profiles ---------------- */
  await db.insert(workerProfiles).values([
    {
      userId: ravi.id,
      workerType: "gig",
      phone: "+91 98XX XX4210",
      city: "Jaipur",
      primaryPlatform: "SwiftDash (delivery)",
      workStartDate: monthsAgoISO(20),
      currentSavings: 21500,
      onboardingComplete: true,
    },
    {
      userId: meena.id,
      workerType: "daily-wage",
      phone: "+91 97XX XX8802",
      city: "Jaipur",
      primaryPlatform: "Construction day work",
      workStartDate: monthsAgoISO(14),
      currentSavings: 4200,
      onboardingComplete: true,
    },
  ]);

  await db.insert(employerProfiles).values({
    userId: employer.id,
    companyName: "ABC Construction",
    industry: "Construction & Infrastructure",
  });

  await db.insert(bankProfiles).values({
    userId: bank.id,
    bankName: "Unity Trust Partner Bank",
  });

  /* ---------------- Work history ---------------- */
  await db.insert(workHistory).values([
    {
      workerId: ravi.id,
      employerName: "SwiftDash",
      role: "Delivery Partner",
      startDate: monthsAgoISO(20),
      isCurrent: true,
    },
    {
      workerId: ravi.id,
      employerName: "City Build Co.",
      role: "Site Helper (daily wage)",
      startDate: monthsAgoISO(34),
      endDate: monthsAgoISO(20),
      isCurrent: false,
    },
    {
      workerId: meena.id,
      employerName: "ABC Construction",
      role: "Masonry Assistant",
      startDate: monthsAgoISO(14),
      isCurrent: true,
    },
  ]);

  /* ---------------- Ravi's connected demo account ---------------- */
  const demoTxs = generateDemoTransactions(7);
  await db.insert(transactions).values(
    demoTxs.map((t) => ({ ...t, workerId: ravi.id, institution: "SwiftPay Demo Bank" }))
  );

  /* ---------------- Income entries (cash wages etc.) ---------------- */
  await db.insert(incomeEntries).values([
    {
      // THE demo-flow record: starts UNVERIFIED, employer confirms it live.
      workerId: ravi.id,
      employerUserId: employer.id,
      date: monthsAgoISO(1, 3),
      source: "ABC Construction",
      description: "Masonry work — day wage",
      amount: 800,
      channel: "cash",
      status: "unverified",
      evidenceNote: "Self-reported. Awaiting employer confirmation.",
    },
    {
      workerId: ravi.id,
      employerUserId: employer.id,
      date: monthsAgoISO(2, 11),
      source: "ABC Construction",
      description: "Brickwork — 2 days",
      amount: 1300,
      channel: "cash",
      status: "verified",
      verificationMethod: "employer_confirmation",
      evidenceNote: "Confirmed by Suresh Patel (ABC Construction).",
      verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40),
    },
    {
      workerId: ravi.id,
      date: monthsAgoISO(1, 18),
      source: "Sharma Interiors",
      description: "Furniture shifting help",
      amount: 900,
      channel: "cash",
      status: "unverified",
      evidenceNote: "Self-reported. No supporting evidence yet.",
    },
    // Meena — mostly verified by ABC Construction
    ...[4, 3, 2, 1].map((m) => ({
      workerId: meena.id,
      employerUserId: employer.id,
      date: monthsAgoISO(m, 14),
      source: "ABC Construction",
      description: "Weekly site wages",
      amount: 4200,
      channel: "cash" as const,
      status: "verified" as const,
      verificationMethod: "employer_confirmation",
      evidenceNote: "Confirmed by Suresh Patel (ABC Construction).",
      verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * m * 28),
    })),
    {
      workerId: meena.id,
      employerUserId: employer.id,
      date: monthsAgoISO(0, 2),
      source: "ABC Construction",
      description: "Plastering work — day wage",
      amount: 950,
      channel: "cash",
      status: "unverified",
      evidenceNote: "Self-reported. Awaiting employer confirmation.",
    },
  ]);

  /* ---------------- Repayments ---------------- */
  await db.insert(repayments).values([
    {
      workerId: ravi.id,
      lender: "Skyline Finance",
      loanType: "Two-wheeler loan",
      monthlyEmi: 3200,
      onTimePayments: 17,
      totalPayments: 18,
      status: "active",
    },
    {
      workerId: ravi.id,
      lender: "CityCarts Consumer Credit",
      loanType: "Consumer durable loan (closed)",
      monthlyEmi: 1100,
      onTimePayments: 6,
      totalPayments: 6,
      status: "closed",
    },
    {
      workerId: meena.id,
      lender: "Self-help group microloan",
      loanType: "SHG microloan",
      monthlyEmi: 500,
      onTimePayments: 9,
      totalPayments: 10,
      status: "active",
    },
  ]);

  /* ---------------- Consents ---------------- */
  await db.insert(consents).values([
    {
      workerId: ravi.id,
      institutionName: "SwiftPay Demo Bank",
      institutionType: "data_provider",
      scopes: "transactions,income,expenses",
      purpose: "Import transaction history to build your financial profile (demo connection).",
      status: "active",
      grantedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50),
    },
    {
      workerId: ravi.id,
      institutionName: "Unity Trust Partner Bank",
      institutionType: "partner_bank",
      scopes: "profile,score,income,savings",
      purpose: "Share your alternative financial profile for further assessment by the bank.",
      status: "active",
      grantedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
    {
      workerId: meena.id,
      institutionName: "Unity Trust Partner Bank",
      institutionType: "partner_bank",
      scopes: "profile,score,income,savings",
      purpose: "Share your alternative financial profile for further assessment by the bank.",
      status: "active",
      grantedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ]);

  console.log("Seed complete.");
  console.log("  Worker   ravi@demo.com / demo123");
  console.log("  Worker   meena@demo.com / demo123");
  console.log("  Employer employer@demo.com / demo123 (ABC Construction)");
  console.log("  Bank     bank@demo.com / demo123 (Unity Trust Partner Bank)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
