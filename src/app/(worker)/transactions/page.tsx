import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildWorkerAnalytics } from "@/lib/data";
import { formatINR, formatDate } from "@/lib/format";
import {
  PageHeader,
  Card,
  CardHeader,
  Stat,
  EmptyState,
  InfoNote,
  Badge,
  Th,
  Td,
} from "@/components/ui";

const CAT_TONES: Record<string, string> = {
  "Platform Earnings": "emerald",
  Rent: "rose",
  Groceries: "amber",
  Fuel: "sky",
  Utilities: "violet",
  Mobile: "slate",
  EMI: "rose",
  "Family Support": "amber",
  "Savings Transfer": "emerald",
  Other: "slate",
} as const;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser("worker");
  const { filter } = await searchParams;
  const a = await buildWorkerAnalytics(user.id);

  if (a.txs.length === 0) {
    return (
      <EmptyState
        icon={<ArrowLeftRight className="size-6" />}
        title="No transactions imported yet"
        body="Connect a demo financial account with your consent, and 6 months of synthetic transaction history will appear here for analysis."
        actionHref="/connect"
        actionLabel="Connect a demo account"
      />
    );
  }

  const filtered =
    filter === "income"
      ? a.txs.filter((t) => t.type === "credit")
      : filter === "expenses"
        ? a.txs.filter((t) => t.type === "debit")
        : a.txs;

  const filters = [
    { id: "", label: "All" },
    { id: "income", label: "Income" },
    { id: "expenses", label: "Expenses" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transaction Analysis"
        subtitle="Transactions imported through your consented demo connection, with automatic totals and variability metrics."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Total income (6 mo)" value={formatINR(a.txs.filter((t) => t.type === "credit").reduce((x, t) => x + t.amount, 0))} tone="good" />
        <Stat label="Total expenses" value={formatINR(a.totalExpense)} />
        <Stat label="Savings rate" value={`${(a.savingsRate * 100).toFixed(1)}%`} tone={a.savingsRate >= 0.1 ? "good" : "warn"} />
        <Stat label="Avg. monthly income" value={formatINR(a.txs.filter((t) => t.type === "credit").reduce((x, t) => x + t.amount, 0) / Math.max(1, a.monthly.length))} />
        <Stat label="Income variability" value={`${(a.cv * 100).toFixed(0)}%`} sub="coefficient of variation" tone="warn" />
      </div>

      <InfoNote>
        These are <span className="font-semibold">synthetic demo transactions</span> from a
        mock institution, imported only after your consent. In a real deployment, data
        would arrive through authorized, consent-based financial-data-sharing mechanisms.
      </InfoNote>

      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-slate-900">All transactions</h3>
            <p className="text-xs text-slate-500">{filtered.length} records · {a.txs[0] ? a.txs[0].institution : ""}</p>
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <a
                key={f.id}
                href={f.id ? `/transactions?filter=${f.id}` : "/transactions"}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  (filter ?? "") === f.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${t.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {t.type === "credit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-slate-900">{t.description}</p>
                <p className="text-[11px] text-slate-400">{formatDate(t.date)} · {t.category}</p>
              </div>
              <p className={`text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-slate-700"}`}>
                {t.type === "credit" ? "+" : "−"}{formatINR(t.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th>Institution</Th>
                <Th className="text-right">Amount</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-slate-50/60">
                  <Td className="whitespace-nowrap text-slate-500">{formatDate(t.date)}</Td>
                  <Td>
                    <span className="flex items-center gap-2.5 font-medium text-slate-900">
                      <span className={`flex size-7 items-center justify-center rounded-lg ${t.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                        {t.type === "credit" ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      </span>
                      {t.description}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={(CAT_TONES[t.category] ?? "slate") as never} dot={false}>{t.category}</Badge>
                  </Td>
                  <Td className="text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="size-3.5 text-slate-300" /> {t.institution}
                    </span>
                  </Td>
                  <Td className={`text-right font-semibold whitespace-nowrap ${t.type === "credit" ? "text-emerald-600" : "text-slate-800"}`}>
                    {t.type === "credit" ? "+" : "−"}{formatINR(t.amount)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
