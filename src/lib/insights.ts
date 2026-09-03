/* ------------------------------------------------------------------ */
/*  Responsible, rule-based financial insights ("AI insights")         */
/*  - Always hedged: "you may consider", "based on your available data" */
/*  - No guaranteed outcomes, no lending promises                      */
/* ------------------------------------------------------------------ */

import { formatINR } from "./format";

export interface Insight {
  type: "positive" | "warning" | "info";
  title: string;
  body: string;
}

export interface InsightData {
  monthlyIncome: { key: string; total: number }[];
  monthlyExpense: { key: string; total: number }[];
  savingsRate: number; // 0-1
  unverifiedCount: number;
  verifiedCount: number;
  emergencyProgress: number; // 0-1
  incomeConfidence: number;
  lastMonthIncome: number;
  avgIncome: number;
}

export function generateInsights(d: InsightData): Insight[] {
  const insights: Insight[] = [];
  const n = d.monthlyIncome.length;

  // Trend: income down + expenses up
  if (n >= 3) {
    const recent = d.monthlyIncome.slice(-3);
    const first = recent[0].total || 1;
    const last = recent[recent.length - 1].total;
    const incomeDelta = (last - first) / first;

    const eRecent = d.monthlyExpense.slice(-3);
    const eFirst = eRecent[0]?.total || 1;
    const eLast = eRecent[eRecent.length - 1]?.total || 0;
    const expenseDelta = (eLast - eFirst) / eFirst;

    if (incomeDelta < -0.08 && expenseDelta > 0.08) {
      insights.push({
        type: "warning",
        title: "Financial pressure may be increasing",
        body: `Based on your available data, income has decreased by about ${Math.abs(
          Math.round(incomeDelta * 100)
        )}% over the last 3 months while expenses have risen by about ${Math.round(
          expenseDelta * 100
        )}%. You may consider reviewing non-essential spending and setting aside any surplus from stronger weeks.`,
      });
    } else if (incomeDelta > 0.1) {
      insights.push({
        type: "positive",
        title: "Income is trending upward",
        body: `Your income has grown by about ${Math.round(
          incomeDelta * 100
        )}% across recent months. You may consider directing a portion of the increase toward your emergency fund while earnings are strong.`,
      });
    }
  }

  // High-income month vs average
  if (d.lastMonthIncome > d.avgIncome * 1.2 && d.avgIncome > 0) {
    const extra = d.lastMonthIncome - d.avgIncome;
    insights.push({
      type: "info",
      title: "A stronger-than-usual month",
      body: `Last month's income was about ${formatINR(extra)} above your average. Based on your available data, you may consider adding part of this surplus to your emergency savings.`,
    });
  }

  // Volatility note
  if (n >= 4) {
    const max = Math.max(...d.monthlyIncome.map((m) => m.total));
    const min = Math.min(...d.monthlyIncome.map((m) => m.total));
    if (max > 0 && max - min > d.avgIncome * 0.8) {
      insights.push({
        type: "info",
        title: "Your income varies month to month",
        body: `Your monthly income has ranged between ${formatINR(min)} and ${formatINR(
          max
        )}. An adaptive savings plan — saving more in strong months and less in lean months — may suit your income pattern better than a fixed monthly amount.`,
      });
    }
  }

  // Savings rate
  if (d.savingsRate > 0 && d.savingsRate < 0.08) {
    insights.push({
      type: "warning",
      title: "Savings rate is below the suggested range",
      body: `You are currently saving about ${Math.round(
        d.savingsRate * 100
      )}% of your income. You may consider gradually increasing savings during higher-income months — small, irregular contributions still build resilience.`,
    });
  } else if (d.savingsRate >= 0.15) {
    insights.push({
      type: "positive",
      title: "Healthy saving habit",
      body: `You are saving roughly ${Math.round(
        d.savingsRate * 100
      )}% of your income. Based on your available data, this is a strong foundation for financial resilience.`,
    });
  }

  // Verification nudges
  if (d.unverifiedCount > 0) {
    insights.push({
      type: "warning",
      title: `${d.unverifiedCount} income record${
        d.unverifiedCount > 1 ? "s are" : " is"
      } still unverified`,
      body: "Self-reported income carries low confidence. You may consider asking your employer to confirm the payment through FinancialBridge, or adding supporting work records, to strengthen your income confidence score.",
    });
  }
  if (d.verifiedCount > 0 && d.incomeConfidence >= 85) {
    insights.push({
      type: "positive",
      title: "Strong income verification",
      body: "Most of your income is supported by employer confirmation or digital records, which raises your income confidence score.",
    });
  }

  // Emergency fund
  if (d.emergencyProgress >= 1) {
    insights.push({
      type: "positive",
      title: "Emergency fund target reached",
      body: "Your savings now cover about 3 months of essential expenses. You may consider keeping this fund accessible and topping it up as expenses change.",
    });
  } else if (d.emergencyProgress > 0 && d.emergencyProgress < 0.5) {
    insights.push({
      type: "info",
      title: "Emergency fund is building",
      body: `Your emergency fund is about ${Math.round(
        d.emergencyProgress * 100
      )}% of the recommended 3-month target. You may consider adding extra during stronger income months.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Keep building your financial identity",
      body: "As more income, savings, and repayment data is recorded and verified, FinancialBridge will surface personalised insights here.",
    });
  }

  return insights.slice(0, 6);
}
