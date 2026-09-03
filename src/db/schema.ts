import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Core identity                                                      */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // worker | employer | bank
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/* ------------------------------------------------------------------ */
/*  Role profiles                                                      */
/* ------------------------------------------------------------------ */

export const workerProfiles = pgTable("worker_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  workerType: text("worker_type").notNull().default("gig"), // gig | daily-wage | freelancer | informal
  phone: text("phone"),
  city: text("city"),
  primaryPlatform: text("primary_platform"),
  workStartDate: date("work_start_date"),
  currentSavings: integer("current_savings").notNull().default(0),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});

export const employerProfiles = pgTable("employer_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
});

export const bankProfiles = pgTable("bank_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
});

/* ------------------------------------------------------------------ */
/*  Worker financial data                                              */
/* ------------------------------------------------------------------ */

export const workHistory = pgTable("work_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employerName: text("employer_name").notNull(),
  role: text("role").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").notNull().default(false),
});

export const incomeEntries = pgTable("income_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  employerUserId: uuid("employer_user_id"), // links to an employer account when known
  date: date("date").notNull(),
  source: text("source").notNull(), // employer / platform name
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // INR
  channel: text("channel").notNull().default("cash"), // cash | digital
  status: text("status").notNull().default("unverified"), // unverified | verified | rejected
  verificationMethod: text("verification_method"), // employer_confirmation | digital_record | work_record
  evidenceNote: text("evidence_note"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  amount: integer("amount").notNull(), // INR, always positive
  type: text("type").notNull(), // credit | debit
  institution: text("institution").notNull(),
});

export const repayments = pgTable("repayments", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lender: text("lender").notNull(),
  loanType: text("loan_type"),
  monthlyEmi: integer("monthly_emi").notNull(),
  onTimePayments: integer("on_time_payments").notNull(),
  totalPayments: integer("total_payments").notNull(),
  status: text("status").notNull().default("active"), // active | closed
});

/* ------------------------------------------------------------------ */
/*  Consent registry                                                   */
/* ------------------------------------------------------------------ */

export const consents = pgTable("consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  institutionName: text("institution_name").notNull(),
  institutionType: text("institution_type").notNull(), // data_provider | partner_bank
  scopes: text("scopes").notNull(), // comma separated
  purpose: text("purpose"),
  status: text("status").notNull().default("active"), // active | revoked
  grantedAt: timestamp("granted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type WorkerProfile = typeof workerProfiles.$inferSelect;
export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type BankProfile = typeof bankProfiles.$inferSelect;
export type WorkHistory = typeof workHistory.$inferSelect;
export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Repayment = typeof repayments.$inferSelect;
export type Consent = typeof consents.$inferSelect;
