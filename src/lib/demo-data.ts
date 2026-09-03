/* ------------------------------------------------------------------ */
/*  Synthetic demo financial data                                      */
/*                                                                     */
/*  HACKATHON PROTOTYPE ONLY. These are mock financial institutions    */
/*  and generated transactions — no real bank connectivity. In a real  */
/*  deployment, data would flow through authorized, consent-based      */
/*  financial-data-sharing mechanisms under applicable regulation.     */
/* ------------------------------------------------------------------ */

export interface DemoInstitution {
  id: string;
  name: string;
  kind: string;
  tagline: string;
}

export const DEMO_INSTITUTIONS: DemoInstitution[] = [
  {
    id: "swiftpay",
    name: "SwiftPay Demo Bank",
    kind: "Payments Bank (Demo)",
    tagline: "Where most gig payouts land for demo workers",
  },
  {
    id: "grameen",
    name: "Grameen Demo Cooperative Bank",
    kind: "Cooperative Bank (Demo)",
    tagline: "Community-focused demo institution",
  },
  {
    id: "nodeday",
    name: "NodeDay Demo Digital Bank",
    kind: "Digital Bank (Demo)",
    tagline: "App-first demo institution",
  },
];

export const DATA_SCOPES = [
  {
    id: "transactions",
    label: "Transaction history",
    detail: "Credits and debits from the last 6 months",
  },
  {
    id: "income",
    label: "Income information",
    detail: "Salary-like credits and platform earnings",
  },
  {
    id: "expenses",
    label: "Expense information",
    detail: "Categorised spending such as rent, groceries, fuel",
  },
];

export const BANK_SCOPES = [
  { id: "profile", label: "Work & income profile" },
  { id: "score", label: "Financial Resilience Score (prototype)" },
  { id: "income", label: "Income statistics & verification status" },
  { id: "savings", label: "Savings & repayment behaviour" },
];

/* Deterministic PRNG so generated data is stable. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeneratedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
}

/** Monthly platform income targets for the last 6 complete months. */
const INCOME_PATTERN = [35000, 22000, 40000, 18000, 31000, 27500];

/** Explicit monthly savings transfers aligned to the income pattern. */
const SAVINGS_PATTERN = [4400, 2200, 4800, 1400, 3600, 3000];

const pad = (n: number) => String(n).padStart(2, "0");

function iso(y: number, m: number, d: number): string {
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${pad(m)}-${pad(Math.min(d, daysInMonth))}`;
}

/** Returns the last 6 complete [year, month] pairs, oldest first. */
export function lastCompleteMonths(count = 6): [number, number][] {
  const out: [number, number][] = [];
  const now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth(); // current month excluded (1-indexed below)
  for (let i = 0; i < count; i++) {
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    out.unshift([y, m]);
    m -= 1;
  }
  return out;
}

export function generateDemoTransactions(seedKey = 7): GeneratedTransaction[] {
  const rand = mulberry32(seedKey * 1013 + 41);
  const months = lastCompleteMonths(6);
  const txs: GeneratedTransaction[] = [];

  months.forEach(([y, m], idx) => {
    const incomeTarget = INCOME_PATTERN[idx];
    const savings = SAVINGS_PATTERN[idx];

    // 4 weekly platform payouts, adjusted to hit the monthly target.
    const weights = [0.22, 0.26, 0.24, 0.28].map((w) => w + (rand() - 0.5) * 0.06);
    const wSum = weights.reduce((a, b) => a + b, 0);
    let paid = 0;
    weights.forEach((w, i) => {
      const day = 3 + i * 7 + Math.floor(rand() * 3);
      let amount = Math.round((incomeTarget * w) / wSum / 50) * 50;
      if (i === weights.length - 1) amount = incomeTarget - paid;
      paid += amount;
      txs.push({
        date: iso(y, m, day),
        description: "SwiftDash weekly payout",
        category: "Platform Earnings",
        amount,
        type: "credit",
      });
    });

    // Fixed living costs.
    txs.push(
      { date: iso(y, m, 1), description: "House rent — UPI transfer", category: "Rent", amount: 8000, type: "debit" },
      { date: iso(y, m, 5), description: "Two-wheeler loan EMI", category: "EMI", amount: 3200, type: "debit" },
      { date: iso(y, m, 9), description: "Mobile recharge", category: "Mobile", amount: 349, type: "debit" },
      { date: iso(y, m, 12), description: "Electricity bill", category: "Utilities", amount: 700 + Math.round(rand() * 320), type: "debit" },
      { date: iso(y, m, 15), description: "Family support — money transfer", category: "Family Support", amount: 2500 + Math.round(rand() * 1200), type: "debit" }
    );

    // Groceries x4
    [4, 11, 18, 25].forEach((d) => {
      txs.push({
        date: iso(y, m, d + Math.floor(rand() * 3)),
        description: "Kirana store — groceries",
        category: "Groceries",
        amount: 480 + Math.round(rand() * 400),
        type: "debit",
      });
    });

    // Fuel x4
    [2, 9, 16, 23].forEach((d) => {
      txs.push({
        date: iso(y, m, d + Math.floor(rand() * 4)),
        description: "Petrol pump — fuel",
        category: "Fuel",
        amount: 300 + Math.round(rand() * 180),
        type: "debit",
      });
    });

    // Misc UPI spends x3
    [6, 14, 22].forEach((d) => {
      txs.push({
        date: iso(y, m, d + Math.floor(rand() * 5)),
        description: "UPI payment — misc",
        category: "Other",
        amount: 220 + Math.round(rand() * 480),
        type: "debit",
      });
    });

    // Adaptive savings transfer.
    txs.push({
      date: iso(y, m, 27),
      description: "Transfer to savings",
      category: "Savings Transfer",
      amount: savings,
      type: "debit",
    });
  });

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}
