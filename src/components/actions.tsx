"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Building2,
  Wallet,
} from "lucide-react";

/* ------------------------------ Helpers ------------------------------ */

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

const labelCls = "mb-1.5 block text-xs font-semibold tracking-wide text-slate-600";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
      {msg}
    </div>
  );
}

/* ------------------------------ Auth ------------------------------ */

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await postJSON("/api/auth/login", {
        email: fd.get("email"),
        password: fd.get("password"),
      });
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email address">
        <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required className={inputCls} placeholder="••••••••" />
      </Field>
      <ErrorBox msg={error} />
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Sign in
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<"worker" | "employer" | "bank">("worker");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await postJSON("/api/auth/register", {
        role,
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        workerType: fd.get("workerType"),
        city: fd.get("city"),
        primaryPlatform: fd.get("primaryPlatform"),
        workStartDate: fd.get("workStartDate"),
        companyName: fd.get("companyName"),
        industry: fd.get("industry"),
        bankName: fd.get("bankName"),
      });
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const roleBtn = (r: typeof role, label: string, desc: string) => (
    <button
      type="button"
      onClick={() => setRole(r)}
      className={`rounded-xl border p-3 text-left transition ${
        role === r
          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <p className={`text-sm font-semibold ${role === r ? "text-emerald-700" : "text-slate-800"}`}>
        {label}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{desc}</p>
    </button>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {roleBtn("worker", "Worker", "Gig, daily-wage, freelance")}
        {roleBtn("employer", "Employer", "Confirm worker payments")}
        {roleBtn("bank", "Partner Bank", "View consented profiles")}
      </div>

      <Field label="Full name">
        <input name="name" required className={inputCls} placeholder="Your full name" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email address">
          <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required minLength={6} className={inputCls} placeholder="Min. 6 characters" />
        </Field>
      </div>

      {role === "worker" && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Worker type">
              <select name="workerType" className={inputCls} defaultValue="gig">
                <option value="gig">Gig / Platform worker</option>
                <option value="daily-wage">Daily-wage worker</option>
                <option value="freelancer">Freelancer</option>
                <option value="informal">Informal / self-employed</option>
              </select>
            </Field>
            <Field label="City">
              <input name="city" className={inputCls} placeholder="e.g. Jaipur" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary work / platform" hint="e.g. SwiftDash delivery, construction day work">
              <input name="primaryPlatform" className={inputCls} placeholder="How you mainly earn" />
            </Field>
            <Field label="Working since" hint="When did you start earning?">
              <input name="workStartDate" type="date" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {role === "employer" && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2">
          <Field label="Company / contractor name">
            <input name="companyName" required className={inputCls} placeholder="e.g. ABC Construction" />
          </Field>
          <Field label="Industry">
            <input name="industry" className={inputCls} placeholder="e.g. Construction" />
          </Field>
        </div>
      )}

      {role === "bank" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <Field label="Bank name (demo)">
            <input name="bankName" required className={inputCls} placeholder="e.g. Unity Trust Partner Bank" />
          </Field>
        </div>
      )}

      <ErrorBox msg={error} />
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Create account
      </button>
      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        Hackathon prototype with synthetic data only. Never enter real banking credentials.
      </p>
    </form>
  );
}

/* ------------------------------ Cash income ------------------------------ */

export function CashIncomeForm({ employers }: { employers: { id: string; company: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkEmployer, setLinkEmployer] = useState(employers.length > 0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await postJSON("/api/worker/income", {
        date: fd.get("date"),
        source: fd.get("source"),
        description: fd.get("description"),
        amount: fd.get("amount"),
        channel: fd.get("channel"),
        employerId: linkEmployer ? fd.get("employerId") : null,
      });
      setDone(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldCheck className="size-6" />
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
          Recorded as <span className="text-amber-600">UNVERIFIED</span>
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
          Self-reported income is never automatically trusted. It now carries{" "}
          <span className="font-semibold text-slate-700">low confidence</span> until an
          employer confirms it or supporting evidence is attached.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={() => setDone(false)}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Record another
          </button>
          <button
            onClick={() => router.push("/income")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            View income records
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of work">
          <input name="date" type="date" required className={inputCls} />
        </Field>
        <Field label="Amount earned (₹)">
          <input name="amount" type="number" min={1} required className={inputCls} placeholder="e.g. 800" />
        </Field>
      </div>
      <Field label="Who paid you?" hint="Employer, contractor, or platform name">
        <input name="source" required className={inputCls} placeholder="e.g. ABC Construction" />
      </Field>
      <Field label="What work did you do?">
        <input name="description" required className={inputCls} placeholder="e.g. Masonry work — day wage" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment channel">
          <select name="channel" className={inputCls} defaultValue="cash">
            <option value="cash">Cash</option>
            <option value="digital">Digital / UPI</option>
          </select>
        </Field>
        {employers.length > 0 && (
          <Field label="Link registered employer (optional)">
            <select
              name="employerId"
              className={inputCls}
              disabled={!linkEmployer}
              onChange={(e) => setLinkEmployer(!!e.target.value)}
            >
              <option value="">None — self-reported only</option>
              {employers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.company}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
      <ErrorBox msg={error} />
      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p className="text-[11.5px] leading-relaxed text-slate-500">
          This entry will be marked <span className="font-semibold text-amber-600">UNVERIFIED</span>.
          If you link a registered employer, they will see a verification request on their
          dashboard and can confirm the payment.
        </p>
      </div>
      <button
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Record cash income
      </button>
    </form>
  );
}

/* ------------------------------ Employer verification ------------------------------ */

export function VerifyButtons({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "confirm" | "reject">("");
  const [err, setErr] = useState("");

  async function act(action: "confirm" | "reject") {
    setBusy(action);
    setErr("");
    try {
      await postJSON("/api/employer/verify", { entryId, action });
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy("");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => act("confirm")}
          disabled={busy !== ""}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy === "confirm" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Confirm
        </button>
        <button
          onClick={() => act("reject")}
          disabled={busy !== ""}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-60"
        >
          {busy === "reject" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
          Reject
        </button>
      </div>
      {err && <p className="text-[11px] text-rose-600">{err}</p>}
    </div>
  );
}

/* ------------------------------ Consent ------------------------------ */

export function RevokeConsentButton({ consentId }: { consentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function revoke() {
    setBusy(true);
    try {
      await postJSON("/api/consents/revoke", { consentId });
      setConfirming(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
      >
        Revoke consent
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={revoke}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {busy && <Loader2 className="size-3.5 animate-spin" />} Confirm revoke
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
      >
        Cancel
      </button>
    </div>
  );
}

export function ShareWithBankForm({ banks }: { banks: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function share(bankName: string) {
    setBusy(true);
    setError("");
    try {
      await postJSON("/api/consents", { bankName });
      setDone(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
        Consent granted. The bank can now view only the profile sections you agreed to
        share. You can revoke this anytime.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {banks.map((b) => (
        <button
          key={b}
          onClick={() => share(b)}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-60"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Landmark className="size-4.5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-slate-900">{b}</span>
            <span className="block text-[11px] text-slate-500">
              Share: profile, resilience score, income stats, savings behaviour
            </span>
          </span>
          <ChevronRight className="size-4 text-slate-300" />
        </button>
      ))}
      {error && <ErrorBox msg={error} />}
    </div>
  );
}

/* ------------------------------ Connect demo account ------------------------------ */

export function ConnectFlow({
  institutions,
  scopes,
}: {
  institutions: { id: string; name: string; kind: string; tagline: string }[];
  scopes: { id: string; label: string; detail: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<(typeof institutions)[number] | null>(null);
  const [checked, setChecked] = useState<string[]>(scopes.map((s) => s.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function toggle(id: string) {
    setChecked((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function approve() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await postJSON("/api/connect", { institutionId: selected.id, scopes: checked });
      setStep(3);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (step === 3 && selected) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-7" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
          Demo account connected
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">{selected.name}</span> has shared
          6 months of synthetic transaction history with FinancialBridge under your
          consent. Your scores are being recalculated now.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => router.push("/transactions")}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            View imported transactions
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 2 && selected) {
    return (
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-slate-900">
                Consent request — {selected.name}
              </p>
              <p className="text-[11.5px] text-slate-500">
                Review what will be shared before approving
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3 p-5">
          {scopes.map((s) => (
            <label
              key={s.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                checked.includes(s.id)
                  ? "border-emerald-300 bg-emerald-50/50"
                  : "border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                checked={checked.includes(s.id)}
                onChange={() => toggle(s.id)}
                className="mt-0.5 size-4 accent-emerald-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{s.label}</span>
                <span className="block text-xs text-slate-500">{s.detail}</span>
              </span>
            </label>
          ))}

          <div className="flex gap-2.5 rounded-xl border border-sky-200/70 bg-sky-50/80 p-3.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" />
            <p className="text-[11.5px] leading-relaxed text-sky-900">
              This demo connection <span className="font-semibold">never asks for passwords,
              PINs or OTPs</span>. In a real deployment, data would move only through
              authorized, consent-based financial-data-sharing mechanisms (such as the
              Account Aggregator framework), and you could withdraw consent at any time.
            </p>
          </div>

          <ErrorBox msg={error} />
          <div className="flex gap-3 pt-1">
            <button
              onClick={approve}
              disabled={busy || checked.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              Approve & share {checked.length} data {checked.length === 1 ? "type" : "types"}
            </button>
            <button
              onClick={() => setStep(1)}
              className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {institutions.map((inst) => (
        <button
          key={inst.id}
          onClick={() => {
            setSelected(inst);
            setStep(2);
          }}
          className="card flex w-full items-center gap-4 p-4 text-left transition hover:border-emerald-300 hover:shadow-md"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <Building2 className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-slate-900">{inst.name}</span>
            <span className="block text-xs text-slate-500">
              {inst.kind} · {inst.tagline}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Connect <ChevronRight className="size-3.5" />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Savings deposit ------------------------------ */

export function DepositSavingsForm({ suggested }: { suggested: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(String(suggested || 500));
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await postJSON("/api/worker/savings", { amount: Number(amount) });
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1">
        <label className={labelCls}>Add to emergency savings (₹)</label>
        <div className="relative">
          <Wallet className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>
      <button
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : null}
        {done ? "Saved" : "Add savings"}
      </button>
    </form>
  );
}

/* ------------------------------ Settings ------------------------------ */

export function SettingsForm({
  role,
  defaults,
}: {
  role: string;
  defaults: Record<string, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await postJSON("/api/profile", Object.fromEntries(fd.entries()));
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <Field label="Display name">
        <input name="name" defaultValue={defaults.name} required className={inputCls} />
      </Field>
      {role === "worker" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Worker type">
              <select name="workerType" defaultValue={defaults.workerType} className={inputCls}>
                <option value="gig">Gig / Platform worker</option>
                <option value="daily-wage">Daily-wage worker</option>
                <option value="freelancer">Freelancer</option>
                <option value="informal">Informal / self-employed</option>
              </select>
            </Field>
            <Field label="City">
              <input name="city" defaultValue={defaults.city} className={inputCls} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary work / platform">
              <input name="primaryPlatform" defaultValue={defaults.primaryPlatform} className={inputCls} />
            </Field>
            <Field label="Working since">
              <input name="workStartDate" type="date" defaultValue={defaults.workStartDate} className={inputCls} />
            </Field>
          </div>
          <Field label="Phone">
            <input name="phone" defaultValue={defaults.phone} className={inputCls} />
          </Field>
        </>
      )}
      {role === "employer" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input name="companyName" defaultValue={defaults.companyName} className={inputCls} />
          </Field>
          <Field label="Industry">
            <input name="industry" defaultValue={defaults.industry} className={inputCls} />
          </Field>
        </div>
      )}
      {role === "bank" && (
        <Field label="Bank name">
          <input name="bankName" defaultValue={defaults.bankName} className={inputCls} />
        </Field>
      )}
      <ErrorBox msg={error} />
      <button
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
        {saved ? "Saved" : "Save changes"}
      </button>
    </form>
  );
}
