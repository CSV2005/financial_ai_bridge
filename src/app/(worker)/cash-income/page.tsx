import { Banknote, ShieldCheck, Building2, FileCheck2, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { employerProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { CashIncomeForm } from "@/components/actions";

const STEPS = [
  {
    icon: <Banknote className="size-4.5" />,
    title: "1. You record the wage",
    body: "Date, who paid you, the work done, and the amount. It is immediately marked UNVERIFIED.",
  },
  {
    icon: <Building2 className="size-4.5" />,
    title: "2. Employer gets a request",
    body: "If the employer is registered, a verification request appears on their dashboard.",
  },
  {
    icon: <FileCheck2 className="size-4.5" />,
    title: "3. Confirmation builds trust",
    body: "When the employer confirms, the record becomes VERIFIED and your Income Confidence Score rises.",
  },
];

export default async function CashIncomePage() {
  await requireUser("worker");
  const employers = await db
    .select({ id: employerProfiles.userId, company: employerProfiles.companyName })
    .from(employerProfiles);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Record Cash Income"
        subtitle="Many workers are paid in cash — that income is real, and it deserves a trustworthy record. Self-reported entries always start as UNVERIFIED."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            How cash verification works
          </h3>
          <div className="mt-4 space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  {s.icon}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{s.body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="mt-2 ml-auto hidden size-4 rotate-90 text-slate-200 lg:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5">
            <p className="flex gap-2 text-[11.5px] leading-relaxed text-amber-800">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>
                <span className="font-semibold">Honesty rule:</span> FinancialBridge never
                automatically treats self-reported income as verified. Unverified income
                carries low confidence until an employer confirms it or supporting
                evidence (work records, payments) is added.
              </span>
            </p>
          </div>
        </Card>

        <div>
          <CashIncomeForm employers={employers} />
          <p className="mt-3 px-1 text-[11px] leading-relaxed text-slate-400">
            Example: <span className="font-medium text-slate-500">3rd of last month · ABC
            Construction · Masonry work · ₹800</span> → appears as UNVERIFIED until ABC
            Construction confirms it from their dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
