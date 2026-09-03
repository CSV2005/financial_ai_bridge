import { UserRound, BriefcaseBusiness, BadgeCheck, TrendingUp, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { formatINR, formatDate, WORKER_TYPES } from "@/lib/format";
import {
  PageHeader,
  Card,
  CardHeader,
  Stat,
  VerificationBadge,
  EmptyState,
  Badge,
} from "@/components/ui";
import { VolatilityBars, ExpenseDonut, SavingsGrowth } from "@/components/charts";

export default async function FinancialProfilePage() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  if (!a.hasData) {
    return (
      <EmptyState
        icon={<UserRound className="size-6" />}
        title="No financial profile yet"
        body="Connect a demo account or record income to generate your financial profile."
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

  const sources = new Map<string, { amount: number; status: string }>();
  for (const e of a.income) {
    if (e.status === "rejected") continue;
    const cur = sources.get(e.source) ?? { amount: 0, status: e.status };
    cur.amount += e.amount;
    if (cur.status !== "verified") cur.status = e.status;
    sources.set(e.source, cur);
  }
  if (a.totalIncome > 0 && a.connectedInstitutions.length > 0) {
    const digital = a.txs.filter((t) => t.type === "credit").reduce((x, t) => x + t.amount, 0);
    if (digital > 0) sources.set("Platform payouts (digital record)", { amount: digital, status: "verified" });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Profile"
        subtitle="A complete picture of your earnings, spending, savings and work history — built from data you own and consent to share."
      />

      {/* Worker summary card */}
      <Card className="flex flex-wrap items-center gap-5">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 font-display text-lg font-bold text-white">
          {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div className="min-w-44 flex-1">
          <p className="font-display text-lg font-bold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">
            {WORKER_TYPES[a.profile?.workerType ?? "gig"]}
            {a.profile?.primaryPlatform ? ` · ${a.profile.primaryPlatform}` : ""}
            {a.profile?.city ? ` · ${a.profile.city}` : ""}
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Resilience score</p>
            <p className="font-display text-xl font-bold text-emerald-600">{a.resilience.score}<span className="text-sm text-slate-400">/900</span></p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Income confidence</p>
            <p className="font-display text-xl font-bold text-slate-900">{a.confidence.score}%</p>
          </div>
        </div>
      </Card>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Avg. monthly income" value={formatINR(a.avgIncome)} sub={`across ${a.monthly.length} months`} icon={<TrendingUp className="size-4" />} />
        <Stat label="Income range" value={`${formatINR(a.minIncome)} – ${formatINR(a.maxIncome)}`} sub="min – max month" />
        <Stat label="Income consistency" value={`${a.resilience.factors.find((f) => f.key === "consistency")?.value ?? 0}%`} sub={`variability (CV) ${(a.cv * 100).toFixed(0)}%`} tone="good" />
        <Stat label="Work history" value={`${a.workMonths} months`} sub="recorded earning period" icon={<CalendarClock className="size-4" />} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Avg. monthly expenses" value={formatINR(a.avgExpense)} sub="living costs (excl. savings)" />
        <Stat label="Avg. monthly savings" value={formatINR(a.avgSavings)} sub={`${(a.savingsRate * 100).toFixed(1)}% of income`} tone="good" />
        <Stat label="Emergency fund" value={formatINR(a.currentSavings)} sub={`target ${formatINR(a.emergencyTarget)}`} />
        <Stat
          label="Repayments"
          value={a.repaymentList.length > 0 ? `${a.repaymentList.reduce((x, r) => x + r.onTimePayments, 0)}/${a.repaymentList.reduce((x, r) => x + r.totalPayments, 0)}` : "—"}
          sub="on-time payments"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Income & volatility" subtitle="Monthly income vs. average — volatile, but consistently earning" />
          <VolatilityBars data={a.monthly} avg={a.avgIncome} />
        </Card>
        <Card>
          <CardHeader title="Where the money goes" subtitle="Expense breakdown across all imported months" />
          {a.categoryBreakdown.length > 0 ? (
            <ExpenseDonut data={a.categoryBreakdown} />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No expense data imported yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Savings growth" subtitle="Monthly deposits and cumulative savings (approximate)" />
        <SavingsGrowth data={cumulative} />
      </Card>

      {/* Income sources + work history */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Income sources" subtitle="Digital records and self-reported / verified income" />
          <div className="space-y-2.5">
            {Array.from(sources.entries()).map(([name, s]) => (
              <div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{formatINR(s.amount)} recorded</p>
                </div>
                <VerificationBadge status={s.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Work history" subtitle="Timeline of earning activity" />
          <div className="space-y-3">
            {a.history.length === 0 && (
              <p className="text-sm text-slate-400">No work history recorded yet.</p>
            )}
            {a.history.map((w) => (
              <div key={w.id} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 flex size-8 items-center justify-center rounded-lg ${w.isCurrent ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    <BriefcaseBusiness className="size-4" />
                  </span>
                  <span className="mt-1 w-px flex-1 bg-slate-100 last:hidden" />
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {w.role} <span className="font-normal text-slate-400">at</span> {w.employerName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(w.startDate)} — {w.isCurrent ? "Present" : formatDate(w.endDate)}
                  </p>
                  {w.isCurrent && (
                    <span className="mt-1.5 inline-block"><Badge tone="emerald" dot={false}>Current</Badge></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Repayments */}
      <Card>
        <CardHeader title="Existing repayments" subtitle="Repayment behaviour strengthens your financial identity" />
        <div className="grid gap-3 sm:grid-cols-2">
          {a.repaymentList.length === 0 && (
            <p className="text-sm text-slate-400 sm:col-span-2">No repayment history recorded.</p>
          )}
          {a.repaymentList.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.lender}</p>
                  <p className="text-xs text-slate-500">{r.loanType}</p>
                </div>
                <Badge tone={r.status === "active" ? "sky" : "slate"} dot={false}>
                  {r.status === "active" ? "Active" : "Closed"}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">EMI</p>
                  <p className="font-display text-base font-bold text-slate-900">{formatINR(r.monthlyEmi)}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-600">
                  {r.onTimePayments}/{r.totalPayments} on time
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <BadgeCheck className="size-4" />
        This profile is shared with a partner bank only when you explicitly grant consent.
      </div>
    </div>
  );
}
