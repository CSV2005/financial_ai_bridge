import { HandCoins, Banknote, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { formatINR, formatDate, CONFIDENCE_LABELS } from "@/lib/format";
import {
  PageHeader,
  Card,
  CardHeader,
  VerificationBadge,
  EmptyState,
  LinkButton,
  Badge,
  ConfidenceBadge,
  Th,
  Td,
} from "@/components/ui";

export default async function IncomePage() {
  const user = await requireUser("worker");
  const a = await buildWorkerAnalytics(user.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Income & Verification"
        subtitle="Every income record shows exactly how much the system can trust it — self-reported income is never treated as verified."
        action={<LinkButton href="/cash-income">Record cash income</LinkButton>}
      />

      {/* Confidence score card */}
      <Card>
        <CardHeader
          title="Income Confidence Score"
          subtitle="How strongly your reported income is supported by available verification"
          action={<ConfidenceBadge band={a.confidence.band} />}
        />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="font-display text-5xl font-bold tracking-tight text-slate-900">
              {a.confidence.score}
              <span className="text-2xl text-slate-400">%</span>
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {a.confidence.explanation.map((line) => (
              <p key={line} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-600">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                {line}
              </p>
            ))}
          </div>
        </div>

        {a.confidence.records.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full">
              <thead className="bg-slate-50/70">
                <tr>
                  <Th>Income source</Th>
                  <Th>Type of support</Th>
                  <Th className="text-right">Amount</Th>
                  <Th className="text-right">Confidence weight</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {a.confidence.records.map((r, i) => (
                  <tr key={i}>
                    <Td className="max-w-52 truncate font-medium text-slate-900 sm:max-w-none">{r.label}</Td>
                    <Td>
                      <Badge
                        tone={r.kind === "self" ? "rose" : r.kind === "digital" ? "sky" : "emerald"}
                        dot={false}
                      >
                        {r.kind === "self"
                          ? "Self-reported"
                          : r.kind === "digital"
                            ? "Digital record"
                            : r.kind === "employer"
                              ? "Employer confirmed"
                              : "Work evidence"}
                      </Badge>
                    </Td>
                    <Td className="text-right whitespace-nowrap">{formatINR(r.amount)}</Td>
                    <Td className="text-right whitespace-nowrap">{r.level}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl bg-rose-50/70 p-3 text-center">
            <p className="text-xs font-bold text-rose-700">Low · Self-reported only</p>
            <p className="mt-0.5 text-[11px] text-rose-600">30% confidence weight</p>
          </div>
          <div className="rounded-xl bg-amber-50/70 p-3 text-center">
            <p className="text-xs font-bold text-amber-700">Medium · Some evidence</p>
            <p className="mt-0.5 text-[11px] text-amber-600">80–90% confidence weight</p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 p-3 text-center">
            <p className="text-xs font-bold text-emerald-700">High · Verified payment</p>
            <p className="mt-0.5 text-[11px] text-emerald-600">95% confidence weight</p>
          </div>
        </div>
      </Card>

      {/* Income records */}
      <Card className="!p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-display text-[15px] font-semibold text-slate-900">
            Recorded income (cash & manual entries)
          </h3>
          <p className="text-xs text-slate-500">
            Digital platform payouts appear in Transactions; these are your manually
            recorded earnings and their verification state.
          </p>
        </div>
        {a.income.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Banknote className="mx-auto size-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No cash income recorded yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Record daily wages and ad-hoc earnings to make them visible.
            </p>
            <div className="mt-4">
              <LinkButton href="/cash-income">Record your first cash income</LinkButton>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {a.income.map((e) => (
                <div key={e.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900">{e.description}</p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {e.source} · {formatDate(e.date)} · {e.channel === "cash" ? "Cash" : "Digital"}
                      </p>
                    </div>
                    <p className="font-display text-base font-bold text-slate-900">{formatINR(e.amount)}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <VerificationBadge status={e.status} />
                    {e.evidenceNote && (
                      <p className="ml-3 line-clamp-1 flex-1 text-right text-[10.5px] text-slate-400">
                        {e.evidenceNote}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="bg-slate-50/70">
                  <tr>
                    <Th>Date</Th>
                    <Th>Payer</Th>
                    <Th>Work</Th>
                    <Th>Channel</Th>
                    <Th>Status</Th>
                    <Th>Note</Th>
                    <Th className="text-right">Amount</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {a.income.map((e) => (
                    <tr key={e.id} className="transition hover:bg-slate-50/60">
                      <Td className="whitespace-nowrap text-slate-500">{formatDate(e.date)}</Td>
                      <Td className="font-medium text-slate-900">{e.source}</Td>
                      <Td className="max-w-44 truncate">{e.description}</Td>
                      <Td>
                        <Badge tone={e.channel === "cash" ? "amber" : "sky"} dot={false}>
                          {e.channel === "cash" ? "Cash" : "Digital"}
                        </Badge>
                      </Td>
                      <Td><VerificationBadge status={e.status} /></Td>
                      <Td className="max-w-56 truncate text-xs text-slate-400">{e.evidenceNote}</Td>
                      <Td className="text-right font-semibold whitespace-nowrap text-slate-900">
                        {formatINR(e.amount)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {a.income.length === 0 && a.txs.length === 0 && (
        <EmptyState
          icon={<HandCoins className="size-6" />}
          title="No income data at all"
          body="Connect a demo account to import digital earnings, or record cash income manually."
          actionHref="/connect"
          actionLabel="Connect a demo account"
        />
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-500">
          Verification states: <span className="font-semibold text-amber-600">UNVERIFIED</span> means
          self-reported only — pending employer confirmation or evidence.{" "}
          <span className="font-semibold text-emerald-600">VERIFIED</span> means confirmed by an
          employer or supported by a payment record. FinancialBridge never upgrades income
          on its own.
        </p>
      </div>
    </div>
  );
}
