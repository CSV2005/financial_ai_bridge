import { ShieldCheck, Landmark, Link2, Building2 } from "lucide-react";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getWorkerConsents } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PageHeader, Card, Badge, EmptyState, Th, Td } from "@/components/ui";
import { RevokeConsentButton, ShareWithBankForm } from "@/components/actions";

const SCOPE_LABELS: Record<string, string> = {
  transactions: "Transaction history",
  income: "Income information",
  expenses: "Expense information",
  profile: "Work & income profile",
  score: "Financial Resilience Score (prototype)",
  savings: "Savings & repayment behaviour",
};

export default async function ConsentPage() {
  const user = await requireUser("worker");
  const consents = await getWorkerConsents(user.id);
  const banks = (await db.select().from(bankProfiles)).map((b) => b.bankName);
  const shareable = banks.filter(
    (b) => !consents.some((c) => c.institutionName === b && c.status === "active")
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Consent Management"
        subtitle="You control your data. See exactly who has access, what is shared, why, and since when — and revoke access at any time."
      />

      {consents.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-6" />}
          title="No consents granted yet"
          body="When you connect a demo account or share your profile with a partner bank, each consent will be recorded here with full detail."
          actionHref="/connect"
          actionLabel="Connect a demo account"
        />
      ) : (
        <div className="space-y-3.5">
          {consents.map((c) => (
            <Card key={c.id} className="!p-0">
              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {c.institutionType === "partner_bank" ? (
                    <Landmark className="size-5" />
                  ) : (
                    <Link2 className="size-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{c.institutionName}</p>
                  <p className="text-xs text-slate-500">
                    {c.institutionType === "partner_bank" ? "Partner bank" : "Financial data provider (demo)"}
                  </p>
                </div>
                {c.status === "active" ? (
                  <>
                    <Badge tone="emerald">Consent active</Badge>
                    <RevokeConsentButton consentId={c.id} />
                  </>
                ) : (
                  <Badge tone="rose">Revoked</Badge>
                )}
              </div>
              <div className="grid gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">What is shared</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.scopes.split(",").map((s) => (
                      <span key={s} className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                        {SCOPE_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">Why</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{c.purpose}</p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">Timeline</p>
                  <p className="mt-1.5 text-xs text-slate-600">
                    Granted: {formatDate(c.grantedAt)}
                    {c.revokedAt && (
                      <>
                        <br />Revoked: {formatDate(c.revokedAt)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Share with partner bank */}
      {shareable.length > 0 && (
        <Card>
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-slate-900">
            <Building2 className="size-4.5 text-emerald-600" />
            Share your profile with a partner bank
          </h3>
          <p className="mt-1.5 mb-4 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            With your explicit consent, the bank can view your Financial Resilience Score,
            Income Confidence Score, income statistics, savings behaviour and verification
            status — an alternative financial profile for{" "}
            <span className="font-medium text-slate-700">their own further assessment</span>.
            Granting consent never implies loan approval.
          </p>
          <ShareWithBankForm banks={shareable} />
        </Card>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500">
          This consent registry mirrors real data-sharing principles: access is specific,
          purpose-bound, time-stamped, and revocable. In production, consent artefacts
          would follow authorized financial-data-sharing standards.
        </p>
      </div>
    </div>
  );
}
