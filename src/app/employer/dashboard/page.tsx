import Link from "next/link";
import { FileCheck2, Users, BadgeCheck, Clock, ArrowRight, Building2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEmployerData } from "@/lib/data";
import { formatINR, formatDate } from "@/lib/format";
import { PageHeader, Card, CardHeader, Stat, VerificationBadge, InfoNote } from "@/components/ui";
import { VerifyButtons } from "@/components/actions";

export default async function EmployerDashboard() {
  const user = await requireUser("employer");
  const entries = await getEmployerData(user);

  const pending = entries.filter((e) => e.entry.status === "unverified");
  const verified = entries.filter((e) => e.entry.status === "verified");
  const uniqueWorkers = new Set(entries.map((e) => e.entry.workerId)).size;
  const verifiedTotal = verified.reduce((a, e) => a + e.entry.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employer Dashboard"
        subtitle="Your confirmations transform workers' self-reported cash wages into trusted, verifiable income records."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending requests" value={String(pending.length)} tone={pending.length > 0 ? "warn" : "default"} icon={<Clock className="size-4" />} />
        <Stat label="Confirmed payments" value={String(verified.length)} tone="good" icon={<BadgeCheck className="size-4" />} />
        <Stat label="Workers linked" value={String(uniqueWorkers)} icon={<Users className="size-4" />} />
        <Stat label="Verified wages" value={formatINR(verifiedTotal)} sub="total confirmed" />
      </div>

      <Card>
        <CardHeader
          title="Pending income-verification requests"
          subtitle="Confirm only payments you genuinely made — your confirmation becomes supporting evidence on the worker's profile"
          action={
            <Link href="/employer/verifications" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        {pending.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-4">
            <BadgeCheck className="size-5 text-emerald-600" />
            <p className="text-sm text-emerald-800">
              All caught up — no pending verification requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((e) => (
              <div
                key={e.entry.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3.5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-200">
                  <FileCheck2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {e.workerName} <span className="font-normal text-slate-400">·</span>{" "}
                    <span className="font-normal text-slate-600">{e.entry.description}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(e.entry.date)} · {e.entry.channel === "cash" ? "Cash" : "Digital"} · claimed{" "}
                    <span className="font-bold text-slate-800">{formatINR(e.entry.amount)}</span>
                  </p>
                </div>
                <VerificationBadge status={e.entry.status} />
                <VerifyButtons entryId={e.entry.id} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="card flex items-start gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Building2 className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            Why your confirmation matters
          </h3>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">
            A worker paid in cash has no bank record of their wage. When you confirm a
            payment, that income moves from <span className="font-medium text-slate-700">low
            confidence (self-reported)</span> to <span className="font-medium text-slate-700">high
            confidence (employer-verified)</span> — strengthening the worker&rsquo;s Income
            Confidence Score and prototype Financial Resilience Score. It takes seconds
            and can change a worker&rsquo;s financial visibility.
          </p>
        </div>
      </div>

      <InfoNote>
        Only confirm payments you actually made. Verified records are evidence on a
        worker&rsquo;s alternative financial profile and must remain trustworthy.
      </InfoNote>
    </div>
  );
}
