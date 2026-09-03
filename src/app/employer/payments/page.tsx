import { IndianRupee } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEmployerData } from "@/lib/data";
import { formatINR, formatDate } from "@/lib/format";
import { PageHeader, Card, Stat, VerificationBadge, EmptyState, Th, Td, Badge } from "@/components/ui";

export default async function EmployerPaymentsPage() {
  const user = await requireUser("employer");
  const entries = await getEmployerData(user);
  const verified = entries.filter((e) => e.entry.status === "verified");
  const total = verified.reduce((a, e) => a + e.entry.amount, 0);

  // Group verified by month for a summary strip.
  const byMonth = new Map<string, number>();
  for (const e of verified) {
    const k = e.entry.date.slice(0, 7);
    byMonth.set(k, (byMonth.get(k) ?? 0) + e.entry.amount);
  }
  const label = (k: string) =>
    new Date(k + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment History"
        subtitle="All wage payments you have confirmed through FinancialBridge."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Confirmed payments" value={String(verified.length)} tone="good" />
        <Stat label="Total wages confirmed" value={formatINR(total)} />
        {Array.from(byMonth.entries()).slice(-2).map(([k, v]) => (
          <Stat key={k} label={`Confirmed in ${label(k)}`} value={formatINR(v)} />
        ))}
      </div>

      {verified.length === 0 ? (
        <EmptyState
          icon={<IndianRupee className="size-6" />}
          title="No confirmed payments yet"
          body="Once you confirm a worker's income-verification request, the payment will be recorded here."
        />
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <Th>Date</Th>
                  <Th>Worker</Th>
                  <Th>Description</Th>
                  <Th>Channel</Th>
                  <Th>Verification</Th>
                  <Th className="text-right">Amount</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verified.map((e) => (
                  <tr key={e.entry.id} className="transition hover:bg-slate-50/60">
                    <Td className="whitespace-nowrap text-slate-500">{formatDate(e.entry.date)}</Td>
                    <Td className="font-medium text-slate-900">{e.workerName}</Td>
                    <Td className="max-w-52 truncate">{e.entry.description}</Td>
                    <Td>
                      <Badge tone={e.entry.channel === "cash" ? "amber" : "sky"} dot={false}>
                        {e.entry.channel === "cash" ? "Cash" : "Digital"}
                      </Badge>
                    </Td>
                    <Td><VerificationBadge status={e.entry.status} /></Td>
                    <Td className="text-right font-semibold whitespace-nowrap">{formatINR(e.entry.amount)}</Td>
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
