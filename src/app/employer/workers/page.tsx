import { Users, BadgeCheck, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEmployerData } from "@/lib/data";
import { formatINR, WORKER_TYPES } from "@/lib/format";
import { PageHeader, Card, CardHeader, Badge, EmptyState } from "@/components/ui";

export default async function EmployerWorkersPage() {
  const user = await requireUser("employer");
  const entries = await getEmployerData(user);

  const byWorker = new Map<
    string,
    {
      name: string;
      type: string;
      city: string | null;
      verified: number;
      verifiedAmt: number;
      pending: number;
      rejected: number;
    }
  >();

  for (const e of entries) {
    const cur =
      byWorker.get(e.entry.workerId) ?? {
        name: e.workerName,
        type: e.workerType ?? "gig",
        city: e.workerCity,
        verified: 0,
        verifiedAmt: 0,
        pending: 0,
        rejected: 0,
      };
    if (e.entry.status === "verified") {
      cur.verified += 1;
      cur.verifiedAmt += e.entry.amount;
    } else if (e.entry.status === "unverified") cur.pending += 1;
    else cur.rejected += 1;
    byWorker.set(e.entry.workerId, cur);
  }

  const workers = Array.from(byWorker.values()).sort((a, b) => b.verifiedAmt - a.verifiedAmt);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Workers"
        subtitle="Workers who linked your company when recording income, with their verification track record."
      />

      {workers.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title="No workers linked yet"
          body="When workers record income paid by you, they will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workers.map((w) => (
            <Card key={w.name}>
              <div className="flex items-start gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 font-display text-sm font-bold text-white">
                  {w.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15px] font-bold text-slate-900">{w.name}</p>
                  <p className="text-xs text-slate-500">
                    {WORKER_TYPES[w.type] ?? w.type}
                    {w.city ? ` · ${w.city}` : ""}
                  </p>
                </div>
                {w.pending > 0 && <Badge tone="amber">{w.pending} pending</Badge>}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-emerald-50/70 p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-700">
                    <BadgeCheck className="size-4" /> {w.verified}
                  </p>
                  <p className="text-[10.5px] font-medium text-emerald-600">confirmed</p>
                </div>
                <div className="rounded-xl bg-amber-50/70 p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-lg font-bold text-amber-700">
                    <Clock className="size-4" /> {w.pending}
                  </p>
                  <p className="text-[10.5px] font-medium text-amber-600">awaiting</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{formatINR(w.verifiedAmt)}</p>
                  <p className="text-[10.5px] font-medium text-slate-500">wages verified</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
