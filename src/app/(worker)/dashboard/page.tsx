import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Sparkles,
  Link2,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { generateInsights } from "@/lib/insights";
import { formatINR, WORKER_TYPES } from "@/lib/format";
import {
  Card,
  CardHeader,
  Stat,
  Progress,
  ScoreRing,
  PrototypeNote,
  EmptyState,
  Badge,
  ConfidenceBadge,
} from "@/components/ui";
import { IncomeExpenseArea } from "@/components/charts";

export default async function WorkerDashboard() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  if (!a.hasData) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
          Namaste, {user.name.split(" ")[0]}
        </h1>
        <EmptyState
          icon={<Wallet className="size-6" />}
          title="Let's build your financial identity"
          body="Connect a demo financial account to import your transaction history, or record your first cash income. Your Financial Resilience Score will appear here once data is available."
          actionHref="/connect"
          actionLabel="Connect a demo account"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/cash-income" className="card flex items-center gap-3 p-4 transition hover:border-emerald-300">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">Record cash income</span>
              <span className="block text-xs text-slate-500">Log a daily wage in seconds</span>
            </span>
          </Link>
          <Link href="/settings" className="card flex items-center gap-3 p-4 transition hover:border-emerald-300">
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <BadgeCheck className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">Complete your profile</span>
              <span className="block text-xs text-slate-500">Work type, city, history</span>
            </span>
          </Link>
        </div>
      </div>
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
  }).slice(0, 3);

  const unverified = a.income.filter((i) => i.status === "unverified");

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Namaste, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {WORKER_TYPES[a.profile?.workerType ?? "gig"]}
            {a.profile?.city ? ` · ${a.profile.city}` : ""}
          </p>
        </div>
        <Badge tone={a.connectedInstitutions.some((c) => c.status === "active") ? "emerald" : "amber"}>
          {a.connectedInstitutions.some((c) => c.status === "active")
            ? "Demo account connected"
            : "No account connected"}
        </Badge>
      </div>

      {/* Unverified nudge */}
      {unverified.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {unverified.length} income record{unverified.length > 1 ? "s" : ""} awaiting verification
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              Self-reported income has low confidence. Ask your employer to confirm it on
              FinancialBridge to raise your Income Confidence Score.
            </p>
          </div>
          <Link href="/income" className="shrink-0 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 hover:bg-white">
            Review
          </Link>
        </div>
      )}

      {/* Score hero */}
      <Card className="overflow-hidden !p-0">
        <div className="grid md:grid-cols-[auto_1fr]">
          <div className="hero-mesh flex flex-col items-center bg-ink-950 px-8 py-8 text-center">
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Financial Resilience Score
            </p>
            <div className="mt-4">
              <ScoreRing score={a.resilience.score} max={900} size={188} dark />
            </div>
            <p className="mt-3 text-sm font-semibold text-emerald-300">{a.resilience.band}</p>
            <p className="mt-1 max-w-52 text-[11px] leading-relaxed text-slate-500">
              Prototype indicator based on your available data
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-slate-900">
                Why this score
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-slate-500 uppercase">
                Transparent model
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {a.resilience.factors.map((f) => (
                <div key={f.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {f.label}
                      <span className="ml-1.5 text-[10px] text-slate-400">
                        {Math.round(f.weight * 100)}%
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900">{f.value}/100</span>
                  </div>
                  <Progress
                    value={f.value}
                    tone={f.value >= 75 ? "emerald" : f.value >= 55 ? "amber" : "rose"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Confidence + quick stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 flex items-center gap-5 sm:col-span-1">
          <div className="relative flex size-20 shrink-0 items-center justify-center">
            <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={a.confidence.score >= 85 ? "#10b981" : a.confidence.score >= 60 ? "#f59e0b" : "#f43f5e"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - a.confidence.score / 100)}
              />
            </svg>
            <span className="absolute font-display text-lg font-bold text-slate-900">
              {a.confidence.score}%
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.06em] text-slate-400 uppercase">
              Income Confidence
            </p>
            <div className="mt-1"><ConfidenceBadge band={a.confidence.band} /></div>
            <Link href="/income" className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600 hover:text-emerald-700">
              Why? <ArrowRight className="size-3" />
            </Link>
          </div>
        </Card>
        <Stat
          label="Avg. monthly income"
          value={formatINR(a.avgIncome)}
          sub={`Range ${formatINR(a.minIncome)} – ${formatINR(a.maxIncome)}`}
          icon={<TrendingUp className="size-4" />}
        />
        <Stat
          label="Current savings"
          value={formatINR(a.currentSavings)}
          sub={`Savings rate ${(a.savingsRate * 100).toFixed(1)}% of income`}
          icon={<PiggyBank className="size-4" />}
        />
        <Stat
          label="Adaptive savings tip"
          value={formatINR(a.adaptive.amount)}
          sub={`For a ${a.monthly.at(-1)?.label ?? "typical"}-like month`}
          icon={<Sparkles className="size-4" />}
        />
      </div>

      {/* Income chart */}
      <Card>
        <CardHeader
          title="Income vs expenses — last 6 months"
          subtitle={`Income variability (CV): ${(a.cv * 100).toFixed(0)}% · Volatile but real earnings`}
        />
        <IncomeExpenseArea data={a.monthly} />
      </Card>

      {/* Insights preview */}
      <Card>
        <CardHeader
          title="AI financial insights"
          subtitle="Responsible, data-based observations — not guaranteed advice"
          action={
            <Link href="/insights" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {insights.map((ins) => (
            <div
              key={ins.title}
              className={`rounded-xl border p-4 ${
                ins.type === "warning"
                  ? "border-amber-200 bg-amber-50/70"
                  : ins.type === "positive"
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-sky-200 bg-sky-50/70"
              }`}
            >
              <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                {ins.type === "warning" ? (
                  <AlertTriangle className="size-4 text-amber-600" />
                ) : ins.type === "positive" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <Info className="size-4 text-sky-600" />
                )}
                {ins.title}
              </p>
              <p className="mt-1.5 line-clamp-4 text-xs leading-relaxed text-slate-600">{ins.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <PrototypeNote />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/cash-income", icon: <Banknote className="size-5" />, label: "Record cash income" },
          { href: "/connect", icon: <Link2 className="size-5" />, label: "Connect accounts" },
          { href: "/savings", icon: <PiggyBank className="size-5" />, label: "Savings plan" },
          { href: "/consent", icon: <BadgeCheck className="size-5" />, label: "Manage consent" },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="card flex flex-col items-center gap-2 p-4 text-center transition hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              {q.icon}
            </span>
            <span className="text-xs font-semibold text-slate-700">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
