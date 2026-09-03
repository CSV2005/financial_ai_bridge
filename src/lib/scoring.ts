/* ------------------------------------------------------------------ */
/*  FinancialBridge — transparent prototype scoring engine             */
/*                                                                     */
/*  This mirrors (in TypeScript) the statistical analytics layer that  */
/*  a production deployment would implement with Python (Pandas,       */
/*  NumPy, Scikit-learn, XGBoost). Every factor is intentionally       */
/*  transparent and explainable — no black-box decisions.              */
/* ------------------------------------------------------------------ */

export interface FactorScore {
  key: string;
  label: string;
  weight: number; // 0-1
  value: number; // 0-100 subscore
  points: number; // contribution to the 0-900 scale
  description: string;
}

export interface ResilienceResult {
  score: number; // 0-900
  band: string;
  factors: FactorScore[];
  insufficient: boolean;
}

export interface ScoreInput {
  monthlyIncome: number[]; // verified + digitally imported income per month
  avgMonthlyIncome: number;
  avgMonthlyExpense: number; // living expenses (excl. explicit savings)
  avgMonthlySavings: number; // explicit savings transfers
  repaymentOnTime: number;
  repaymentTotal: number;
  workHistoryMonths: number;
  incomeConfidence: number; // 0-100
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function coefficientOfVariation(nums: number[]): number {
  if (nums.length < 2) return 0;
  const m = mean(nums);
  if (m === 0) return 1;
  const variance =
    nums.reduce((acc, n) => acc + (n - m) * (n - m), 0) / nums.length;
  return Math.sqrt(variance) / m;
}

/** Income consistency: rewards low month-to-month volatility (CV). */
export function incomeConsistency(monthlyIncome: number[]): number {
  if (monthlyIncome.length < 2) return 35;
  const cv = coefficientOfVariation(monthlyIncome);
  return clamp(Math.round(100 - 70 * cv), 5, 100);
}

/** Expense management: living-expense-to-income ratio. */
export function expenseScore(avgExpense: number, avgIncome: number): number {
  if (avgIncome <= 0) return 0;
  const ratio = avgExpense / avgIncome;
  return clamp(Math.round(((1 - ratio) / 0.35) * 100), 0, 100);
}

/** Savings behaviour: monthly savings rate. */
export function savingsScore(avgSavings: number, avgIncome: number): number {
  if (avgIncome <= 0) return 0;
  const rate = avgSavings / avgIncome;
  return clamp(Math.round(rate * 650), 0, 100);
}

export function repaymentScore(onTime: number, total: number): number {
  if (total <= 0) return 60; // no repayment history recorded — neutral
  return clamp(Math.round((onTime / total) * 100), 0, 100);
}

export function historyScore(months: number): number {
  return clamp(Math.round((months / 24) * 100), 0, 100);
}

export function scoreBand(score: number): string {
  if (score >= 750) return "Strong financial resilience";
  if (score >= 650) return "Developing financial resilience";
  if (score >= 500) return "Emerging financial resilience";
  return "Early-stage financial profile";
}

export function computeResilienceScore(input: ScoreInput): ResilienceResult {
  const insufficient =
    input.monthlyIncome.length === 0 || input.avgMonthlyIncome <= 0;

  const consistency = incomeConsistency(input.monthlyIncome);
  const cv = coefficientOfVariation(input.monthlyIncome);
  const savings = savingsScore(input.avgMonthlySavings, input.avgMonthlyIncome);
  const expense = expenseScore(input.avgMonthlyExpense, input.avgMonthlyIncome);
  const repayment = repaymentScore(input.repaymentOnTime, input.repaymentTotal);
  const history = historyScore(input.workHistoryMonths);
  const confidence = clamp(Math.round(input.incomeConfidence), 0, 100);

  const factors: FactorScore[] = [
    {
      key: "consistency",
      label: "Income consistency",
      weight: 0.25,
      value: consistency,
      points: 0,
      description: `Month-to-month income variability (CV) is ${(cv * 100).toFixed(
        0
      )}%. Lower variability means steadier earnings.`,
    },
    {
      key: "confidence",
      label: "Income verification confidence",
      weight: 0.18,
      value: confidence,
      points: 0,
      description:
        "Share of income supported by digital records, employer confirmation, or work evidence vs. self-reporting.",
    },
    {
      key: "savings",
      label: "Savings behaviour",
      weight: 0.17,
      value: savings,
      points: 0,
      description: `Averages ${(input.avgMonthlyIncome > 0
        ? (input.avgMonthlySavings / input.avgMonthlyIncome) * 100
        : 0
      ).toFixed(1)}% of monthly income set aside as savings.`,
    },
    {
      key: "repayment",
      label: "Repayment behaviour",
      weight: 0.16,
      value: repayment,
      points: 0,
      description:
        input.repaymentTotal > 0
          ? `${input.repaymentOnTime} of ${input.repaymentTotal} recorded repayments were on time.`
          : "No repayment history recorded yet — treated neutrally.",
    },
    {
      key: "expense",
      label: "Expense management",
      weight: 0.12,
      value: expense,
      points: 0,
      description: `Living expenses consume ${(input.avgMonthlyIncome > 0
        ? (input.avgMonthlyExpense / input.avgMonthlyIncome) * 100
        : 0
      ).toFixed(0)}% of average monthly income.`,
    },
    {
      key: "history",
      label: "Work & income history",
      weight: 0.12,
      value: history,
      points: 0,
      description: `${input.workHistoryMonths} months of work / income history recorded.`,
    },
  ];

  const weighted = factors.reduce((acc, f) => acc + f.value * f.weight, 0);
  const score = insufficient
    ? 0
    : clamp(Math.round((weighted / 100) * 900), 0, 900);

  for (const f of factors) {
    f.points = Math.round(f.value * f.weight * 9);
  }

  return { score, band: scoreBand(score), factors, insufficient };
}

/* ------------------------------------------------------------------ */
/*  Income Confidence Score (0-100%)                                   */
/* ------------------------------------------------------------------ */

export interface ConfidenceRecord {
  label: string;
  amount: number;
  level: number; // 0-100
  kind: "digital" | "employer" | "evidence" | "self";
}

export interface ConfidenceResult {
  score: number;
  band: "high" | "medium" | "low";
  records: ConfidenceRecord[];
  explanation: string[];
}

export const CONFIDENCE_LEVELS = {
  digital: 90, // imported via consented financial-data connection
  employer: 95, // confirmed by employer / payment record
  evidence: 80, // supported by verified work records
  self: 30, // self-reported only
} as const;

export function computeIncomeConfidence(
  records: ConfidenceRecord[]
): ConfidenceResult {
  const total = records.reduce((a, r) => a + r.amount, 0);
  if (total <= 0) {
    return {
      score: 0,
      band: "low",
      records,
      explanation: [
        "No income records available yet. Connect a demo account or record income to build confidence.",
      ],
    };
  }
  const score = Math.round(
    records.reduce((a, r) => a + r.amount * r.level, 0) / total
  );
  const band = score >= 85 ? "high" : score >= 60 ? "medium" : "low";

  const explanation: string[] = [];
  const selfAmt = records
    .filter((r) => r.kind === "self")
    .reduce((a, r) => a + r.amount, 0);
  const digAmt = records
    .filter((r) => r.kind === "digital")
    .reduce((a, r) => a + r.amount, 0);
  const verAmt = records
    .filter((r) => r.kind === "employer" || r.kind === "evidence")
    .reduce((a, r) => a + r.amount, 0);

  if (digAmt > 0)
    explanation.push(
      `${Math.round((digAmt / total) * 100)}% of income is supported by digitally imported transaction records.`
    );
  if (verAmt > 0)
    explanation.push(
      `${Math.round((verAmt / total) * 100)}% is confirmed by an employer or payment record.`
    );
  if (selfAmt > 0)
    explanation.push(
      `${Math.round((selfAmt / total) * 100)}% is self-reported only, which lowers the confidence score until supporting evidence is added.`
    );
  explanation.push(
    band === "high"
      ? "Income is strongly supported by available verification."
      : band === "medium"
        ? "Income is partially supported. Verifying more records would raise confidence."
        : "Income is mostly self-reported. Employer confirmation or digital records are needed for higher confidence."
  );

  return { score, band, records, explanation };
}

/* ------------------------------------------------------------------ */
/*  Adaptive savings — adapts to irregular income                      */
/* ------------------------------------------------------------------ */

export interface SavingsRecommendation {
  amount: number;
  ratePct: number;
  tier: string;
  note: string;
}

export function adaptiveSavings(monthlyIncome: number): SavingsRecommendation {
  if (monthlyIncome <= 0) {
    return {
      amount: 0,
      ratePct: 0,
      tier: "No income recorded",
      note: "Record or import income to receive an adaptive savings recommendation.",
    };
  }
  let rate: number;
  let tier: string;
  let note: string;
  if (monthlyIncome >= 38000) {
    rate = 0.1;
    tier = "Strong income month";
    note =
      "Income is strong this month. You may consider directing a larger share toward your emergency fund while earnings are high.";
  } else if (monthlyIncome >= 28000) {
    rate = 0.085;
    tier = "Good income month";
    note =
      "A solid month. You may consider saving a moderate amount while keeping a buffer for essentials.";
  } else if (monthlyIncome >= 20000) {
    rate = 0.06;
    tier = "Moderate income month";
    note =
      "Income is moderate this month. A smaller saving keeps momentum without straining essential expenses.";
  } else if (monthlyIncome >= 14000) {
    rate = 0.04;
    tier = "Lean income month";
    note =
      "Income is lower this month. The recommendation automatically shrinks — prioritize essential expenses first.";
  } else {
    rate = 0.02;
    tier = "Very low income month";
    note =
      "Income is very limited. Focus on essential expenses; even a very small saving keeps the habit alive.";
  }
  return {
    amount: Math.round(monthlyIncome * rate),
    ratePct: rate * 100,
    tier,
    note,
  };
}

/** Emergency fund target = 3 months of essential expenses. */
export function emergencyFundTarget(essentialMonthly: number): number {
  return Math.round(essentialMonthly * 3);
}
