import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  consents,
  incomeEntries,
  repayments,
  transactions,
  users,
  workerProfiles,
  workHistory,
  type Consent,
  type IncomeEntry,
  type Repayment,
  type Transaction,
  type User,
  type WorkerProfile,
  type WorkHistory,
} from "@/db/schema";
import {
  computeIncomeConfidence,
  computeResilienceScore,
  adaptiveSavings,
  emergencyFundTarget,
  mean,
  coefficientOfVariation,
  type ResilienceResult,
  type ConfidenceResult,
  type ConfidenceRecord,
  type SavingsRecommendation,
} from "./scoring";
import { monthKey, monthLabel, monthsBetween, todayISO } from "./format";

/* ------------------------------------------------------------------ */
/*  Raw fetchers                                                       */
/* ------------------------------------------------------------------ */

export async function getWorkerProfile(userId: string) {
  const rows = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getWorkerTransactions(workerId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.workerId, workerId))
    .orderBy(desc(transactions.date));
}

export async function getWorkerIncome(workerId: string) {
  return db
    .select()
    .from(incomeEntries)
    .where(eq(incomeEntries.workerId, workerId))
    .orderBy(desc(incomeEntries.date), desc(incomeEntries.createdAt));
}

export async function getWorkerRepayments(workerId: string) {
  return db.select().from(repayments).where(eq(repayments.workerId, workerId));
}

export async function getWorkerHistory(workerId: string) {
  return db
    .select()
    .from(workHistory)
    .where(eq(workHistory.workerId, workerId))
    .orderBy(workHistory.startDate);
}

export async function getWorkerConsents(workerId: string) {
  return db
    .select()
    .from(consents)
    .where(eq(consents.workerId, workerId))
    .orderBy(desc(consents.grantedAt));
}

/* ------------------------------------------------------------------ */
/*  Aggregates                                                         */
/* ------------------------------------------------------------------ */

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number; // living expense (excl. savings transfers)
  savings: number;
}

export interface WorkerAnalytics {
  profile: WorkerProfile | null;
  txs: Transaction[];
  income: IncomeEntry[];
  repaymentList: Repayment[];
  history: WorkHistory[];
  consentList: Consent[];
  monthly: MonthlyPoint[];
  totalIncome: number;
  totalExpense: number;
  totalSavingsTransfers: number;
  avgIncome: number;
  minIncome: number;
  maxIncome: number;
  avgExpense: number;
  avgSavings: number;
  savingsRate: number; // 0-1
  cv: number; // income variability
  essentialMonthly: number;
  resilience: ResilienceResult;
  confidence: ConfidenceResult;
  workMonths: number;
  adaptive: SavingsRecommendation;
  emergencyTarget: number;
  currentSavings: number;
  connectedInstitutions: Consent[];
  categoryBreakdown: { name: string; value: number }[];
  hasData: boolean;
}

const ESSENTIAL_CATEGORIES = new Set([
  "Rent",
  "Groceries",
  "Fuel",
  "Utilities",
  "Mobile",
  "EMI",
]);

export async function buildWorkerAnalytics(
  workerId: string
): Promise<WorkerAnalytics> {
  const [profile, txs, income, repaymentList, history, consentList] =
    await Promise.all([
      getWorkerProfile(workerId),
      getWorkerTransactions(workerId),
      getWorkerIncome(workerId),
      getWorkerRepayments(workerId),
      getWorkerHistory(workerId),
      getWorkerConsents(workerId),
    ]);

  /* ---- Monthly buckets over the last 6 complete months ---- */
  const creditsByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();
  const savingsByMonth = new Map<string, number>();
  const catMap = new Map<string, number>();

  let totalIncome = 0;
  let totalExpense = 0;
  let totalSavingsTransfers = 0;

  for (const t of txs) {
    const k = monthKey(t.date);
    if (t.type === "credit") {
      creditsByMonth.set(k, (creditsByMonth.get(k) ?? 0) + t.amount);
      totalIncome += t.amount;
    } else if (t.category === "Savings Transfer") {
      savingsByMonth.set(k, (savingsByMonth.get(k) ?? 0) + t.amount);
      totalSavingsTransfers += t.amount;
    } else {
      expenseByMonth.set(k, (expenseByMonth.get(k) ?? 0) + t.amount);
      totalExpense += t.amount;
      catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
    }
  }

  // Verified cash/other income adds to the month it was earned.
  const verifiedIncome = income.filter((i) => i.status === "verified");
  const unverifiedIncome = income.filter((i) => i.status === "unverified");
  for (const e of verifiedIncome) {
    const k = monthKey(e.date);
    creditsByMonth.set(k, (creditsByMonth.get(k) ?? 0) + e.amount);
    totalIncome += e.amount;
  }

  const keys = Array.from(
    new Set([
      ...creditsByMonth.keys(),
      ...expenseByMonth.keys(),
      ...savingsByMonth.keys(),
    ])
  ).sort();

  const monthly: MonthlyPoint[] = keys.map((k) => ({
    key: k,
    label: monthLabel(k),
    income: creditsByMonth.get(k) ?? 0,
    expense: expenseByMonth.get(k) ?? 0,
    savings: savingsByMonth.get(k) ?? 0,
  }));

  const incomeSeries = monthly.map((m) => m.income);
  const monthCount = Math.max(1, monthly.length);

  const avgIncome = mean(incomeSeries.filter((v) => v > 0)) || 0;
  const minIncome = incomeSeries.length ? Math.min(...incomeSeries) : 0;
  const maxIncome = incomeSeries.length ? Math.max(...incomeSeries) : 0;
  const avgExpense = monthly.reduce((a, m) => a + m.expense, 0) / monthCount;
  const avgSavings = monthly.reduce((a, m) => a + m.savings, 0) / monthCount;
  const savingsRate = avgIncome > 0 ? avgSavings / avgIncome : 0;
  const cv = coefficientOfVariation(incomeSeries.filter((v) => v > 0));

  // Essential monthly spend (for emergency-fund target)
  const essentialTotal = txs
    .filter((t) => t.type === "debit" && ESSENTIAL_CATEGORIES.has(t.category))
    .reduce((a, t) => a + t.amount, 0);
  const essentialMonthly = essentialTotal / monthCount;

  /* ---- Income confidence ---- */
  const digitalTotal = txs
    .filter((t) => t.type === "credit")
    .reduce((a, t) => a + t.amount, 0);

  const records: ConfidenceRecord[] = [];
  if (digitalTotal > 0) {
    records.push({
      label: "Digitally imported income (consented connection)",
      amount: digitalTotal,
      level: 90,
      kind: "digital",
    });
  }
  for (const e of verifiedIncome) {
    const method = e.verificationMethod ?? "work_record";
    records.push({
      label: `${e.source} — ${e.description}`,
      amount: e.amount,
      level:
        method === "employer_confirmation" ? 95 : method === "digital_record" ? 90 : 80,
      kind: method === "employer_confirmation" ? "employer" : "evidence",
    });
  }
  for (const e of unverifiedIncome) {
    records.push({
      label: `${e.source} — ${e.description} (self-reported)`,
      amount: e.amount,
      level: 30,
      kind: "self",
    });
  }
  const confidence = computeIncomeConfidence(records);

  /* ---- Work history length ---- */
  const dates = history.map((h) => h.startDate).sort();
  const earliest = profile?.workStartDate ?? dates[0] ?? null;
  const workMonths = earliest ? monthsBetween(earliest) : 0;

  /* ---- Repayment ---- */
  const onTime = repaymentList.reduce((a, r) => a + r.onTimePayments, 0);
  const repTotal = repaymentList.reduce((a, r) => a + r.totalPayments, 0);

  /* ---- Resilience score ---- */
  const resilience = computeResilienceScore({
    monthlyIncome: incomeSeries.filter((v) => v > 0),
    avgMonthlyIncome: avgIncome,
    avgMonthlyExpense: avgExpense,
    avgMonthlySavings: avgSavings,
    repaymentOnTime: onTime,
    repaymentTotal: repTotal,
    workHistoryMonths: workMonths,
    incomeConfidence: confidence.score,
  });

  const lastMonthIncome = monthly.length
    ? monthly[monthly.length - 1].income
    : 0;

  const adaptive = adaptiveSavings(lastMonthIncome || avgIncome);
  const emergencyTarget = emergencyFundTarget(essentialMonthly || 0);
  const currentSavings = profile?.currentSavings ?? 0;

  const categoryBreakdown = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const connectedInstitutions = consentList.filter(
    (c) => c.institutionType === "data_provider"
  );

  return {
    profile,
    txs,
    income,
    repaymentList,
    history,
    consentList,
    monthly,
    totalIncome,
    totalExpense,
    totalSavingsTransfers,
    avgIncome,
    minIncome,
    maxIncome,
    avgExpense,
    avgSavings,
    savingsRate,
    cv,
    essentialMonthly,
    resilience,
    confidence,
    workMonths,
    adaptive,
    emergencyTarget,
    currentSavings,
    connectedInstitutions,
    categoryBreakdown,
    hasData: txs.length > 0 || income.length > 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Employer-side data                                                 */
/* ------------------------------------------------------------------ */

export async function getEmployerData(employer: User) {
  const entries = await db
    .select({
      entry: incomeEntries,
      workerName: users.name,
      workerType: workerProfiles.workerType,
      workerCity: workerProfiles.city,
    })
    .from(incomeEntries)
    .innerJoin(users, eq(users.id, incomeEntries.workerId))
    .leftJoin(workerProfiles, eq(workerProfiles.userId, users.id))
    .where(eq(incomeEntries.employerUserId, employer.id))
    .orderBy(desc(incomeEntries.createdAt));
  return entries;
}

/* ------------------------------------------------------------------ */
/*  Bank-side data (consented workers only)                            */
/* ------------------------------------------------------------------ */

export async function getConsentedWorkers(bankName: string) {
  const rows = await db
    .select({
      consent: consents,
      user: users,
      profile: workerProfiles,
    })
    .from(consents)
    .innerJoin(users, eq(users.id, consents.workerId))
    .leftJoin(workerProfiles, eq(workerProfiles.userId, users.id))
    .where(eq(consents.institutionName, bankName));

  const unique = new Map<string, (typeof rows)[number]>();
  // Active consent wins; otherwise most recent revoked record.
  for (const r of rows) {
    const existing = unique.get(r.user.id);
    if (!existing || r.consent.status === "active") unique.set(r.user.id, r);
  }
  return Array.from(unique.values());
}

export async function getWorkerById(workerId: string) {
  const rows = await db.select().from(users).where(eq(users.id, workerId)).limit(1);
  return rows[0] ?? null;
}

export function today(): string {
  return todayISO();
}
