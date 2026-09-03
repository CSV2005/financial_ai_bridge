import { FileCheck2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEmployerData } from "@/lib/data";
import { formatINR, formatDate } from "@/lib/format";
import { PageHeader, Card, CardHeader, VerificationBadge, EmptyState, Th, Td } from "@/components/ui";
import { VerifyButtons } from "@/components/actions";

export default async function VerificationsPage() {
  const user = await requireUser("employer");
  const entries = await getEmployerData(user);

  const pending = entries.filter((e) => e.entry.status === "unverified");
  const history = entries.filter((e) => e.entry.status !== "unverified");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Verification Requests"
        subtitle="Review self-reported income from your workers and confirm or reject each payment."
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="size-6" />}
          title="No requests yet"
          body="When a worker records cash income and links your company, the verification request will appear here."
        />
      ) : (
        <>
          <Card className="!p-0">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-display text-[15px] font-semibold text-slate-900">
                Pending ({pending.length})
              </h3>
              <p className="text-xs text-slate-500">Confirm only payments you genuinely made.</p>
            </div>
            {pending.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                No pending requests right now.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.map((e) => (
                  <div key={e.entry.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{e.workerName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {e.entry.description} · {formatDate(e.entry.date)} ·{" "}
                        {e.entry.channel === "cash" ? "Cash" : "Digital"}
                      </p>
                      {e.entry.evidenceNote && (
                        <p className="mt-0.5 text-[11px] text-slate-400">{e.entry.evidenceNote}</p>
                      )}
                    </div>
                    <p className="font-display text-lg font-bold text-slate-900">
                      {formatINR(e.entry.amount)}
                    </p>
                    <VerificationBadge status={e.entry.status} />
                    <VerifyButtons entryId={e.entry.id} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="!p-0">
            <CardHeader title="Verification history" subtitle={`${history.length} processed requests`} />
            <div className="overflow-x-auto px-1 pb-3">
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Worker</Th>
                    <Th>Date</Th>
                    <Th>Description</Th>
                    <Th className="text-right">Amount</Th>
                    <Th>Decision</Th>
                    <Th>Note</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((e) => (
                    <tr key={e.entry.id} className="transition hover:bg-slate-50/60">
                      <Td className="font-medium text-slate-900">{e.workerName}</Td>
                      <Td className="whitespace-nowrap text-slate-500">{formatDate(e.entry.date)}</Td>
                      <Td className="max-w-44 truncate">{e.entry.description}</Td>
                      <Td className="text-right font-semibold whitespace-nowrap">{formatINR(e.entry.amount)}</Td>
                      <Td><VerificationBadge status={e.entry.status} /></Td>
                      <Td className="max-w-60 truncate text-xs text-slate-400">{e.entry.evidenceNote}</Td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <Td className="py-8 text-center text-slate-400" />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
