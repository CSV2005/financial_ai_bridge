import { ShieldCheck, Lock } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles, consents, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PageHeader, Card, Badge, EmptyState, Th, Td, InfoNote } from "@/components/ui";

const SCOPE_LABELS: Record<string, string> = {
  profile: "Work & income profile",
  score: "Resilience score (prototype)",
  income: "Income stats & verification",
  savings: "Savings & repayments",
  transactions: "Transactions",
  expenses: "Expenses",
};

export default async function ConsentedDataPage() {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  const bankName = profile?.bankName ?? "";

  const rows = await db
    .select({ consent: consents, workerName: users.name })
    .from(consents)
    .innerJoin(users, eq(users.id, consents.workerId))
    .where(eq(consents.institutionName, bankName))
    .orderBy(desc(consents.grantedAt));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Consented Data Register"
        subtitle="Every data-access grant to your bank — fully auditable, purpose-bound, and revocable by the worker at any time."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-6" />}
          title="No consents recorded"
          body="Consent grants from workers will be registered here with scope, purpose and timeline."
        />
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <Th>Worker</Th>
                  <Th>Data shared</Th>
                  <Th>Purpose</Th>
                  <Th>Granted</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.consent.id} className="transition hover:bg-slate-50/60">
                    <Td className="font-medium text-slate-900">{r.workerName}</Td>
                    <Td>
                      <div className="flex max-w-64 flex-wrap gap-1">
                        {r.consent.scopes.split(",").map((s) => (
                          <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600">
                            {SCOPE_LABELS[s] ?? s}
                          </span>
                        ))}
                      </div>
                    </Td>
                    <Td className="max-w-72 text-xs leading-relaxed text-slate-500">
                      {r.consent.purpose}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">{formatDate(r.consent.grantedAt)}</Td>
                    <Td>
                      {r.consent.status === "active" ? (
                        <Badge tone="emerald">Active</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <Badge tone="rose">Revoked</Badge>
                          <Lock className="size-3.5 text-rose-400" />
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <InfoNote>
        When consent is revoked, access stops immediately and the worker&rsquo;s profile is
        no longer visible anywhere in this portal. This mirrors production consent-registry
        behaviour from authorized data-sharing frameworks.
      </InfoNote>
    </div>
  );
}
