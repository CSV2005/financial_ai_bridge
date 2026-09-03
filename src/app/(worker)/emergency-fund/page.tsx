import { LifeBuoy, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { PageHeader, Card, CardHeader, Stat, Progress, InfoNote, EmptyState } from "@/components/ui";
import { DepositSavingsForm } from "@/components/actions";

export default async function EmergencyFundPage() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  if (!a.hasData || a.emergencyTarget <= 0) {
    return (
      <EmptyState
        icon={<LifeBuoy className="size-6" />}
        title="Emergency fund target needs expense data"
        body="Connect a demo account so essential monthly expenses (rent, groceries, fuel, utilities) can be estimated."
        actionHref="/connect"
        actionLabel="Connect a demo account"
      />
    );
  }

  const pct = Math.min(100, (a.currentSavings / a.emergencyTarget) * 100);
  const remaining = Math.max(0, a.emergencyTarget - a.currentSavings);
  const monthlyDeposit = Math.max(100, a.adaptive.amount);
  const monthsToGoal = remaining > 0 ? Math.ceil(remaining / monthlyDeposit) : 0;

  const essentials = a.categoryBreakdown.filter((c) =>
    ["Rent", "Groceries", "Fuel", "Utilities", "Mobile", "EMI"].includes(c.name)
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Emergency Fund"
        subtitle="A safety buffer for lean months, illness, or repairs — sized from your real essential expenses, not a generic number."
      />

      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-400" />
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Recommended target · 3 months of essentials
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-900">
              {formatINR(a.emergencyTarget)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Essential expenses ≈ {formatINR(a.essentialMonthly)} / month × 3
            </p>
          </div>
          <div className="flex size-20 items-center justify-center rounded-3xl bg-sky-50 text-sky-600">
            <LifeBuoy className="size-9" />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-1.5 flex items-end justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {formatINR(a.currentSavings)}{" "}
              <span className="font-normal text-slate-400">saved so far</span>
            </p>
            <p className="text-sm font-semibold text-emerald-600">{pct.toFixed(0)}%</p>
          </div>
          <Progress value={pct} tone="sky" className="h-3" />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Remaining: {formatINR(remaining)}</span>
            {remaining > 0 && monthlyDeposit > 0 && (
              <span>
                ≈ {monthsToGoal} month{monthsToGoal > 1 ? "s" : ""} at {formatINR(monthlyDeposit)}/month
                (adaptive)
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <DepositSavingsForm suggested={a.adaptive.amount} />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Current savings" value={formatINR(a.currentSavings)} />
        <Stat label="Remaining to target" value={formatINR(remaining)} tone={remaining === 0 ? "good" : "default"} />
        <Stat label="Monthly coverage" value={`${((a.currentSavings / Math.max(1, a.essentialMonthly))).toFixed(1)} mo`} sub="of essential expenses" />
      </div>

      <Card>
        <CardHeader title="Essential expenses behind the target" subtitle="Averaged per month across your imported data" />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {essentials.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">{c.name}</p>
              <p className="text-sm font-bold text-slate-900">
                {formatINR(c.value / Math.max(1, a.monthly.length))}
                <span className="ml-1 text-[10px] font-medium text-slate-400">/mo</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-emerald-900">
          <span className="font-semibold">Why 3 months?</span> For irregular earners, even a
          small buffer changes everything — it converts a bad month from a crisis into an
          inconvenience. Start tiny if needed; the adaptive plan grows with your income.
        </p>
      </div>

      <InfoNote>
        This target is an illustrative guideline calculated from your available data —
        not mandatory financial advice. You may consider adjusting it to your family
        situation.
      </InfoNote>
    </div>
  );
}
