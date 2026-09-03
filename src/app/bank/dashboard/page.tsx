import Link from "next/link";
import { Users, Gauge, ShieldCheck, ArrowRight, Eye, EyeOff, ClipboardList } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getConsentedWorkers, buildWorkerAnalytics } from "@/lib/data";
import { PageHeader, Card, CardHeader, Stat, Badge, Progress, InfoNote } from "@/components/ui";
import { formatINR, formatDate, WORKER_TYPES } from "@/lib/format";

export default async function BankDashboard() {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  const bankName = profile?.bankName ?? "Partner Bank";

  const workers = await getConsentedWorkers(bankName);
  const active = workers.filter((w) => w.consent.status === "active");
  const analytics = await Promise.all(active.map((w) => buildWorkerAnalytics(w.user.id)));

  const withScore = analytics.filter((a) => !a.resilience.insufficient);
  const avgScore = withScore.length
    ? Math.round(withScore.reduce((x, a) => x + a.resilience.score, 0) / withScore.length)
    : 0;
  const highConf = analytics.filter((a) => a.confidence.band === "high").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${bankName} — Dashboard`}
        subtitle="Alternative financial profiles of workers who explicitly consented to share their data with your bank."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Workers with active consent" value={String(active.length)} icon={<ShieldCheck className="size-4" />} tone="good" />
        <Stat label="Avg. resilience score" value={avgScore ? `${avgScore}/900` : "—"} icon={<Gauge className="size-4" />} />
        <Stat label="High income confidence" value={`${highConf}/${analytics.length}`} sub="actively shared profiles" />
        <Stat label="Revoked consents" value={String(workers.length - active.length)} sub="access removed" tone={workers.length - active.length > 0 ? "warn" : "default"} />
      </div>

      <div className="card flex flex-wrap items-center gap-4 border-sky-200/70 bg-sky-50/60 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 ring-1 ring-sky-200">
          <Eye className="size-5" />
        </span>
        <p className="max-w-4xl flex-1 text-[13px] leading-relaxed text-sky-900">
          <span className="font-semibold">Consent-gated access:</span> you can only view
          profiles where consent is active. When a worker revokes consent, their profile
          and scores immediately disappear from your view. The Financial Resilience Score
          is a <span className="font-semibold">prototype supplementary indicator</span> — the
          final lending decision always belongs to your bank, following its own assessment,
          policies and applicable regulations.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Consented worker profiles"
          subtitle="Workers without salary slips, made legible through verified alternative data"
          action={
            <Link href="/bank/assessment" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Open assessment view <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        {active.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-5">
            <EyeOff className="size-5 text-slate-400" />
            <p className="text-sm text-slate-500">
              No worker has granted consent yet. Profiles appear here the moment a worker
              shares them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((w, i) => {
              const a = analytics[i];
              return (
                <Link
                  key={w.user.id}
                  href={`/bank/assessment/${w.user.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition hover:border-emerald-300 hover:shadow-sm"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-slate-900 font-display text-xs font-bold text-white">
                    {w.user.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{w.user.name}</p>
                    <p className="text-xs text-slate-500">
                      {WORKER_TYPES[w.profile?.workerType ?? "gig"] ?? "Worker"}
                      {w.profile?.city ? ` · ${w.profile.city}` : ""} · consent since{" "}
                      {formatDate(w.consent.grantedAt)}
                    </p>
                  </div>
                  <div className="hidden w-44 sm:block">
                    <p className="mb-1 flex justify-between text-[10.5px] font-semibold text-slate-400">
                      <span>RESILIENCE</span>
                      <span className="text-slate-700">{a.resilience.insufficient ? "—" : `${a.resilience.score}/900`}</span>
                    </p>
                    <Progress value={a.resilience.score / 9} tone={a.resilience.score >= 700 ? "emerald" : "amber"} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10.5px] font-semibold text-slate-400">INCOME CONFIDENCE</p>
                    <Badge tone={a.confidence.band === "high" ? "emerald" : a.confidence.band === "medium" ? "amber" : "rose"}>
                      {a.confidence.score}%
                    </Badge>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-[10.5px] font-semibold text-slate-400">AVG. INCOME</p>
                    <p className="text-sm font-bold text-slate-900">{a.avgIncome ? formatINR(a.avgIncome) : "—"}</p>
                  </div>
                  <ArrowRight className="size-4 text-slate-300" />
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="flex flex-wrap items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ClipboardList className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            Run a full financial assessment
          </h3>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Score breakdown, income stability, verification status and repayment history —
            everything a bank needs to see a worker clearly for the first time.
          </p>
        </div>
        <Link
          href="/bank/assessment"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Open assessment
        </Link>
      </Card>

      <InfoNote>
        All profiles shown here are built from <span className="font-semibold">synthetic demo
        data</span>. FinancialBridge never displays &ldquo;Loan Approved&rdquo; — outcomes
        are described only as suitability for <span className="font-semibold">further
        assessment</span> by your bank.
      </InfoNote>
    </div>
  );
}
