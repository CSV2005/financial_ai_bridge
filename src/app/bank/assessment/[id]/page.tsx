import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles, consents } from "@/db/schema";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Gavel,
  Scale,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics, getWorkerById } from "@/lib/data";
import { formatINR, formatDate, WORKER_TYPES } from "@/lib/format";
import {
  PageHeader,
  Card,
  CardHeader,
  ScoreRing,
  Progress,
  Badge,
  VerificationBadge,
  ConfidenceBadge,
  Th,
  Td,
} from "@/components/ui";
import { IncomeExpenseArea } from "@/components/charts";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("bank");
  const [bank] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  const bankName = bank?.bankName ?? "";

  // Consent gate — the bank sees NOTHING without active consent.
  const consentRows = await db
    .select()
    .from(consents)
    .where(and(eq(consents.workerId, id), eq(consents.institutionName, bankName)))
    .limit(1);
  const consent = consentRows[0];

  if (!consent || consent.status !== "active") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock className="size-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900">Access not available</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          This worker has not granted {bankName || "your bank"} active consent to view
          their financial profile{consent ? " (consent was revoked)" : ""}. FinancialBridge
          shares data only with explicit worker consent.
        </p>
        <Link
          href="/bank/assessment"
          className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to assessments
        </Link>
      </div>
    );
  }

  const worker = await getWorkerById(id);
  if (!worker) {
    return <p className="py-20 text-center text-sm text-slate-500">Worker not found.</p>;
  }

  const a = await buildWorkerAnalytics(id);

  const assessment =
    a.resilience.insufficient || a.resilience.score < 550
      ? {
          tone: "slate" as const,
          label: "Early-stage profile",
          detail:
            "Limited verified alternative data at this time. More income history or verification may strengthen the profile.",
        }
      : a.resilience.score >= 700 && a.confidence.score >= 80
        ? {
            tone: "emerald" as const,
            label: "Potentially suitable for further assessment",
            detail:
              "The alternative financial profile demonstrates consistent earning capacity, verified income and responsible financial behaviour.",
          }
        : {
            tone: "amber" as const,
            label: "May benefit from additional verification",
            detail:
              "The profile shows real financial activity, but parts of the reported income remain self-reported. Additional verification could provide a clearer picture.",
          };

  const unverifiedCount = a.income.filter((i) => i.status === "unverified").length;

  return (
    <div className="space-y-5">
      <Link
        href="/bank/assessment"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="size-4" /> All assessments
      </Link>

      {/* Header */}
      <Card className="flex flex-wrap items-center gap-5">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 font-display text-lg font-bold text-white">
          {worker.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
            {worker.name}
          </h1>
          <p className="text-sm text-slate-500">
            {WORKER_TYPES[a.profile?.workerType ?? "gig"] ?? "Worker"}
            {a.profile?.primaryPlatform ? ` · ${a.profile.primaryPlatform}` : ""}
            {a.profile?.city ? ` · ${a.profile.city}` : ""} · {a.workMonths} months history
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone="emerald">
            <ShieldCheck className="size-3" /> Consent active since {formatDate(consent.grantedAt)}
          </Badge>
          <p className="text-[10.5px] text-slate-400">
            No traditional salary slip available — alternative data profile shown
          </p>
        </div>
      </Card>

      {/* Determination banner */}
      <div
        className={`rounded-2xl border p-5 ${
          assessment.tone === "emerald"
            ? "border-emerald-200 bg-emerald-50/70"
            : assessment.tone === "amber"
              ? "border-amber-200 bg-amber-50/70"
              : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
              assessment.tone === "emerald"
                ? "bg-emerald-100 text-emerald-700"
                : assessment.tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            <Gavel className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-bold text-slate-900">{assessment.label}</p>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
              {assessment.detail}
            </p>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-slate-500">
              <Scale className="mt-0.5 size-3.5 shrink-0" />
              The Financial Resilience Score is a prototype supplementary indicator. It is
              not a credit-bureau score and does not constitute loan approval. The final
              lending decision belongs solely to your bank, subject to its own assessment,
              policies and applicable regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card className="flex flex-col items-center justify-center p-6">
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            Financial Resilience Score
          </p>
          <div className="my-3">
            {a.resilience.insufficient ? (
              <div className="flex size-40 items-center justify-center rounded-full bg-slate-50 text-center text-xs text-slate-400">
                Insufficient data
              </div>
            ) : (
              <ScoreRing score={a.resilience.score} max={900} size={168} />
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900">{a.resilience.band}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Prototype · 0–900 scale · not a CIBIL score</p>
          <div className="mt-4 w-full border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Income Confidence Score
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-slate-900">
              {a.confidence.score}%
            </p>
            <ConfidenceBadge band={a.confidence.band} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Score factor breakdown"
            subtitle="Fully transparent — every factor that produced this score"
          />
          <div className="space-y-3.5">
            {a.resilience.factors.map((f) => (
              <div key={f.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {f.label}
                    <span className="ml-1.5 font-normal text-slate-400">
                      weight {Math.round(f.weight * 100)}%
                    </span>
                  </span>
                  <span className="text-slate-500">
                    {f.value}/100 <span className="font-semibold text-slate-900">· {f.points} pts</span>
                  </span>
                </div>
                <Progress value={f.value} tone={f.value >= 75 ? "emerald" : f.value >= 55 ? "amber" : "rose"} />
                <p className="mt-1 text-[11px] leading-snug text-slate-400">{f.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Avg. monthly income", v: a.avgIncome ? formatINR(a.avgIncome) : "—", s: `range ${formatINR(a.minIncome)}–${formatINR(a.maxIncome)}` },
          { l: "Income stability", v: `${a.resilience.factors.find((f) => f.key === "consistency")?.value ?? 0}%`, s: `volatility ${(a.cv * 100).toFixed(0)}% CV` },
          { l: "Savings", v: formatINR(a.currentSavings), s: `rate ${(a.savingsRate * 100).toFixed(1)}% of income` },
          {
            l: "Repayments",
            v: a.repaymentList.length
              ? `${a.repaymentList.reduce((x, r) => x + r.onTimePayments, 0)}/${a.repaymentList.reduce((x, r) => x + r.totalPayments, 0)} on time`
              : "None recorded",
            s: a.repaymentList.length ? `${a.repaymentList.filter((r) => r.status === "active").length} active facility` : "neutral factor",
          },
        ].map((s) => (
          <div key={s.l} className="card p-4">
            <p className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">{s.l}</p>
            <p className="mt-1 font-display text-lg font-bold text-slate-900 sm:text-xl">{s.v}</p>
            <p className="text-[11px] text-slate-500">{s.s}</p>
          </div>
        ))}
      </div>

      {/* Income trend */}
      {a.monthly.length > 0 && (
        <Card>
          <CardHeader
            title="Income & expense trend"
            subtitle="From the worker's consented financial data"
          />
          <IncomeExpenseArea data={a.monthly} />
        </Card>
      )}

      {/* Verification status & work history */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Income verification status"
            subtitle={unverifiedCount > 0 ? `${unverifiedCount} record(s) still self-reported` : "All recorded income supported"}
          />
          <div className="space-y-2.5">
            {a.income.length === 0 && (
              <p className="text-sm text-slate-400">No manual income records — digital records only.</p>
            )}
            {a.income.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {e.source} · {formatINR(e.amount)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {e.description} · {formatDate(e.date)}
                  </p>
                  {e.evidenceNote && (
                    <p className="mt-0.5 truncate text-[10.5px] text-slate-400">{e.evidenceNote}</p>
                  )}
                </div>
                <VerificationBadge status={e.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Work history" subtitle="Earning timeline declared by the worker" />
          <div className="space-y-3">
            {a.history.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{w.role}</p>
                  <p className="text-xs text-slate-500">{w.employerName}</p>
                </div>
                <p className="text-xs whitespace-nowrap text-slate-500">
                  {formatDate(w.startDate)} — {w.isCurrent ? "Present" : formatDate(w.endDate)}
                </p>
              </div>
            ))}
          </div>
          {a.repaymentList.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Repayment facilities
              </p>
              {a.repaymentList.map((r) => (
                <div key={r.id} className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {r.lender} · {formatINR(r.monthlyEmi)}/mo
                  </span>
                  <Badge tone={r.onTimePayments === r.totalPayments ? "emerald" : "amber"} dot={false}>
                    {Math.round((r.onTimePayments / Math.max(1, r.totalPayments)) * 100)}% on time
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="flex items-start gap-3.5 border-slate-300 bg-slate-50">
        <BadgeCheck className="mt-0.5 size-5 shrink-0 text-slate-400" />
        <p className="text-[12.5px] leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">About this profile:</span> this
          alternative financial profile combines consented digital transaction history,
          employer-verified income, savings and repayment behaviour for a worker without a
          traditional salary account. It is designed to supplement — never replace — your
          bank&rsquo;s own credit assessment, including bureau checks. FinancialBridge does
          not guarantee any lending outcome.
        </p>
      </Card>
    </div>
  );
}
