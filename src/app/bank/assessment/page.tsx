import Link from "next/link";
import { ClipboardList, ArrowRight, Gauge } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getConsentedWorkers, buildWorkerAnalytics } from "@/lib/data";
import { PageHeader, Card, Badge, EmptyState, ScoreRing } from "@/components/ui";
import { formatINR, WORKER_TYPES } from "@/lib/format";

export default async function AssessmentIndexPage() {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  const workers = (await getConsentedWorkers(profile?.bankName ?? "")).filter(
    (w) => w.consent.status === "active"
  );
  const analytics = await Promise.all(workers.map((w) => buildWorkerAnalytics(w.user.id)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Assessment"
        subtitle="Select a consented worker to review their full alternative financial profile."
      />

      {workers.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title="No assessable profiles"
          body="Assessment is available only for workers who have granted active consent to your bank."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map((w, i) => {
            const a = analytics[i];
            const label = a.resilience.insufficient
              ? "Insufficient data for assessment"
              : a.resilience.score >= 700
                ? "Potentially suitable for further assessment"
                : a.resilience.score >= 550
                  ? "May benefit from additional verification"
                  : "Early-stage profile — limited data";
            return (
              <Link key={w.user.id} href={`/bank/assessment/${w.user.id}`} className="group">
                <Card className="flex h-full flex-col items-center p-6 text-center transition group-hover:border-emerald-300 group-hover:shadow-md">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 font-display text-sm font-bold text-white">
                    {w.user.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                  </span>
                  <p className="mt-3 font-display text-base font-bold text-slate-900">{w.user.name}</p>
                  <p className="text-xs text-slate-500">
                    {WORKER_TYPES[w.profile?.workerType ?? "gig"] ?? "Worker"}
                    {w.profile?.city ? ` · ${w.profile.city}` : ""}
                  </p>
                  <div className="my-4">
                    {a.resilience.insufficient ? (
                      <span className="flex size-32 items-center justify-center rounded-full bg-slate-50 text-center text-[11px] font-medium text-slate-400">
                        <Gauge className="mr-1 size-4" /> No score yet
                      </span>
                    ) : (
                      <ScoreRing score={a.resilience.score} max={900} size={128} stroke={11} />
                    )}
                  </div>
                  <Badge tone={a.resilience.score >= 700 ? "emerald" : a.resilience.score >= 550 ? "amber" : "slate"} dot={false}>
                    {label}
                  </Badge>
                  <div className="mt-4 grid w-full grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-left">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Confidence</p>
                      <p className="text-sm font-bold text-slate-900">{a.confidence.score}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Avg. income</p>
                      <p className="text-sm font-bold text-slate-900">{a.avgIncome ? formatINR(a.avgIncome) : "—"}</p>
                    </div>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                    Open full assessment <ArrowRight className="size-3.5" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
