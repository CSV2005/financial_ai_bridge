import { PiggyBank, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { adaptiveSavings } from "@/lib/scoring";
import { formatINR } from "@/lib/format";
import { PageHeader, Card, CardHeader, Stat, InfoNote, EmptyState } from "@/components/ui";
import { SavingsGrowth } from "@/components/charts";
import { DepositSavingsForm } from "@/components/actions";

export default async function SavingsPage() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  if (!a.hasData) {
    return (
      <EmptyState
        icon={<PiggyBank className="size-6" />}
        title="Savings recommendations need income data"
        body="Connect a demo account or record income so the adaptive savings engine can learn your income pattern."
        actionHref="/connect"
        actionLabel="Connect a demo account"
      />
    );
  }

  const cumulative = a.monthly.reduce<{ label: string; saved: number; cumulative: number }[]>(
    (acc, m) => {
      const prev = acc.at(-1)?.cumulative ?? Math.max(0, a.currentSavings - a.totalSavingsTransfers);
      acc.push({ label: m.label, saved: m.savings, cumulative: prev + m.savings });
      return acc;
    },
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Adaptive Savings"
        subtitle="Fixed 'save ₹5,000 every month' advice fails on irregular income. FinancialBridge adapts the recommendation to each month's earnings."
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Current recommendation */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
                This month&rsquo;s recommendation
              </p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-900">
                {formatINR(a.adaptive.amount)}
              </p>
              <p className="mt-1 text-sm font-medium text-emerald-600">
                {a.adaptive.ratePct}% of a {formatINR(a.monthly.at(-1)?.income ?? a.avgIncome)} month
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="size-5" />
            </span>
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 p-3.5 text-[13px] leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-900">{a.adaptive.tier}:</span>{" "}
            {a.adaptive.note}
          </p>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <DepositSavingsForm suggested={a.adaptive.amount} />
          </div>
        </Card>

        {/* How it adapts */}
        <Card>
          <CardHeader title="How the recommendation adapts" subtitle="Based on the last 6 months of your income" />
          <div className="space-y-2.5">
            {a.monthly.map((m) => {
              const rec = adaptiveSavings(m.income);
              const isLast = m.key === a.monthly.at(-1)?.key;
              return (
                <div
                  key={m.key}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 ${
                    isLast ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {m.income >= a.avgIncome ? (
                      <TrendingUp className="size-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-4 text-amber-500" />
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">
                        {m.label} · {formatINR(m.income)}
                      </p>
                      <p className="text-[10.5px] text-slate-400">{rec.tier}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${isLast ? "text-emerald-700" : "text-slate-600"}`}>
                    → {formatINR(rec.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Saved (6 months)" value={formatINR(a.totalSavingsTransfers)} tone="good" />
        <Stat label="Savings rate" value={`${(a.savingsRate * 100).toFixed(1)}%`} sub="of average income" />
        <Stat label="Current savings" value={formatINR(a.currentSavings)} />
      </div>

      <Card>
        <CardHeader title="Savings growth" subtitle="Deposits mirror your income — higher in strong months, gentler in lean ones" />
        <SavingsGrowth data={cumulative} />
      </Card>

      <InfoNote>
        Adaptive recommendations are <span className="font-semibold">suggestions, not instructions</span>.
        Based on your available data, you may consider saving more in strong months and
        protecting essential expenses in lean months. No outcome is guaranteed.
      </InfoNote>
    </div>
  );
}
