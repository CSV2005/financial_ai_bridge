import Link from "next/link";
import { Users, Lock, ArrowRight } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getConsentedWorkers, buildWorkerAnalytics } from "@/lib/data";
import { PageHeader, Card, Badge, EmptyState, Th, Td, VerificationBadge } from "@/components/ui";
import { formatINR, formatDate, WORKER_TYPES } from "@/lib/format";

export default async function BankProfilesPage() {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  const workers = await getConsentedWorkers(profile?.bankName ?? "");
  const active = workers.filter((w) => w.consent.status === "active");
  const revoked = workers.filter((w) => w.consent.status !== "active");
  const analytics = await Promise.all(active.map((w) => buildWorkerAnalytics(w.user.id)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Worker Profiles"
        subtitle="A directory of every worker who has interacted with your consent requests."
      />

      {workers.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title="No consented workers yet"
          body="When a worker shares their profile with your bank, it will appear here."
        />
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <Th>Worker</Th>
                  <Th>Worker type</Th>
                  <Th>Avg. income</Th>
                  <Th>Resilience score</Th>
                  <Th>Confidence</Th>
                  <Th>Consent status</Th>
                  <Th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map((w, i) => {
                  const a = analytics[i];
                  return (
                    <tr key={w.user.id} className="transition hover:bg-slate-50/60">
                      <Td>
                        <span className="flex items-center gap-2.5 font-medium text-slate-900">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 font-display text-[10px] font-bold text-white">
                            {w.user.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                          </span>
                          {w.user.name}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {WORKER_TYPES[w.profile?.workerType ?? "gig"] ?? "—"}
                        {w.profile?.city ? <span className="text-slate-400"> · {w.profile.city}</span> : null}
                      </Td>
                      <Td className="whitespace-nowrap">{a.avgIncome ? formatINR(a.avgIncome) : "—"}</Td>
                      <Td className="whitespace-nowrap font-semibold">
                        {a.resilience.insufficient ? "Insufficient data" : `${a.resilience.score}/900`}
                      </Td>
                      <Td>
                        <Badge tone={a.confidence.band === "high" ? "emerald" : a.confidence.band === "medium" ? "amber" : "rose"}>
                          {a.confidence.score}% {a.confidence.band}
                        </Badge>
                      </Td>
                      <Td><VerificationBadge status="verified" /></Td>
                      <Td>
                        <Link
                          href={`/bank/assessment/${w.user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Assess <ArrowRight className="size-3" />
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
                {revoked.map((w) => (
                  <tr key={w.user.id} className="opacity-60">
                    <Td>
                      <span className="flex items-center gap-2.5 font-medium text-slate-500">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-slate-200 font-display text-[10px] font-bold text-slate-500">
                          {w.user.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                        </span>
                        {w.user.name}
                      </span>
                    </Td>
                    <td colSpan={4} className="px-4 py-3 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Lock className="size-3.5" /> Profile hidden — consent revoked on {formatDate(w.consent.revokedAt)}
                      </span>
                    </td>
                    <Td><Badge tone="rose">Revoked</Badge></Td>
                    <Td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
