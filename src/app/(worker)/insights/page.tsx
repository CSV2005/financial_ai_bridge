import { Sparkles, AlertTriangle, CheckCircle2, Info, BrainCircuit } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { generateInsights } from "@/lib/insights";
import { PageHeader, Card, EmptyState, InfoNote } from "@/components/ui";

export default async function InsightsPage() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  if (!a.hasData) {
    return (
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title="Insights need some data first"
        body="Connect a demo account or record income and FinancialBridge will analyze patterns in your earnings, spending and savings."
        actionHref="/connect"
        actionLabel="Connect a demo account"
      />
    );
  }

  const insights = generateInsights({
    monthlyIncome: a.monthly.map((m) => ({ key: m.key, total: m.income })),
    monthlyExpense: a.monthly.map((m) => ({ key: m.key, total: m.expense })),
    savingsRate: a.savingsRate,
    unverifiedCount: a.income.filter((i) => i.status === "unverified").length,
    verifiedCount: a.income.filter((i) => i.status === "verified").length,
    emergencyProgress: a.emergencyTarget > 0 ? a.currentSavings / a.emergencyTarget : 0,
    incomeConfidence: a.confidence.score,
    lastMonthIncome: a.monthly.at(-1)?.income ?? 0,
    avgIncome: a.avgIncome,
  });

  const iconFor = (t: string) =>
    t === "warning" ? (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <AlertTriangle className="size-5" />
      </span>
    ) : t === "positive" ? (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-5" />
      </span>
    ) : (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <Info className="size-5" />
      </span>
    );

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Financial Insights"
        subtitle="Pattern-based observations generated from your available data — always suggestions to consider, never guarantees."
      />

      <Card className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <BrainCircuit className="size-5.5" />
        </span>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            How these insights work
          </h3>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">
            FinancialBridge analyzes income trends, expense shifts, savings rate,
            verification status and emergency-fund progress. Each insight is worded
            responsibly — <span className="font-medium text-slate-700">&ldquo;you may consider&rdquo;</span>,
            <span className="font-medium text-slate-700"> &ldquo;based on your available data&rdquo;</span> —
            because no tool can promise financial outcomes.
          </p>
        </div>
      </Card>

      <div className="space-y-3.5">
        {insights.map((ins) => (
          <Card key={ins.title} className="flex gap-4">
            {iconFor(ins.type)}
            <div>
              <p className="text-[15px] font-semibold text-slate-900">{ins.title}</p>
              <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">{ins.body}</p>
              <p className="mt-2 text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                {ins.type === "warning" ? "Needs attention" : ins.type === "positive" ? "Going well" : "Observation"}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <InfoNote>
        Insights are generated from <span className="font-semibold">synthetic demo data</span> in
        this prototype. They are informational only and do not constitute financial advice
        or a guarantee of any outcome.
      </InfoNote>
    </div>
  );
}
