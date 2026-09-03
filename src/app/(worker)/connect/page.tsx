import { Link2, ShieldCheck, LockKeyhole } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWorkerConsents } from "@/lib/data";
import { DEMO_INSTITUTIONS, DATA_SCOPES } from "@/lib/demo-data";
import { PageHeader, Card, Badge, InfoNote } from "@/components/ui";
import { ConnectFlow, RevokeConsentButton } from "@/components/actions";
import { formatDate } from "@/lib/format";

export default async function ConnectPage() {
  const user = await requireUser("worker");
  const consents = await getWorkerConsents(user.id);
  const providers = consents.filter((c) => c.institutionType === "data_provider");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Connect Financial Accounts"
        subtitle="Link a demo financial institution through a consent-based flow. Your transaction history powers your financial profile."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="h-fit">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-slate-900">
            <LockKeyhole className="size-4.5 text-emerald-600" />
            Consent-first, credential-free
          </h3>
          <ul className="mt-3.5 space-y-3 text-[13px] leading-relaxed text-slate-600">
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              This is a <span className="font-semibold">hackathon demo</span> with mock
              institutions and synthetic data — no real bank connectivity.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              FinancialBridge <span className="font-semibold">never asks for bank passwords,
              PINs, OTPs or credentials</span> — and neither should anyone else.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              You approve exactly which data types are shared, and you may revoke
              consent at any time.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              In production, data would flow only through authorized, consent-based
              financial-data-sharing mechanisms (e.g. the Account Aggregator framework).
            </li>
          </ul>
        </Card>

        <Card className="h-fit">
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            Connected demo institutions
          </h3>
          {providers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Nothing connected yet. Choose an institution below to begin.
            </p>
          ) : (
            <div className="mt-3.5 space-y-2.5">
              {providers.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                    <Link2 className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.institutionName}</p>
                    <p className="text-[11px] text-slate-500">
                      Since {formatDate(c.grantedAt)} · {c.scopes.split(",").join(", ")}
                    </p>
                  </div>
                  {c.status === "active" ? (
                    <>
                      <Badge tone="emerald">Active</Badge>
                      <RevokeConsentButton consentId={c.id} />
                    </>
                  ) : (
                    <Badge tone="rose">Revoked</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <h3 className="mb-3 font-display text-[15px] font-semibold text-slate-900">
          Available demo institutions
        </h3>
        <ConnectFlow institutions={DEMO_INSTITUTIONS} scopes={DATA_SCOPES} />
      </div>

      <InfoNote>
        Approving a connection imports 6 months of <span className="font-semibold">synthetic
        transactions</span> into your dashboard and recalculates your scores. Nothing here
        touches a real account.
      </InfoNote>
    </div>
  );
}
