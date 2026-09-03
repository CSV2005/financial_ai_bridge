import Link from "next/link";
import {
  Landmark,
  ArrowRight,
  Wallet,
  ShieldCheck,
  LineChart,
  HandCoins,
  Building2,
  Briefcase,
  FileCheck2,
  Sparkles,
  PiggyBank,
  Fingerprint,
  LockKeyhole,
  BadgeCheck,
  CircleAlert,
} from "lucide-react";
import { getSessionUser, dashboardPath } from "@/lib/auth";
import { ScoreRing } from "@/components/ui";

const PROBLEM_STATS = [
  { value: "~40 crore", label: "Indians earn without a formal salary slip" },
  { value: "₹800/day", label: "Real cash income that leaves no formal record" },
  { value: "0", label: "Documents a daily-wage worker can show a bank" },
];

const STEPS = [
  {
    icon: <Fingerprint className="size-5" />,
    title: "Build the worker profile",
    body: "The worker records their work history, income, expenses, savings and repayments — in plain, simple language.",
  },
  {
    icon: <LockKeyhole className="size-5" />,
    title: "Connect with consent",
    body: "A consent-based connection (demo) imports digital transaction history. No passwords, PINs or OTPs — ever.",
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: "Verify informal income",
    body: "Cash wages stay UNVERIFIED until an employer confirms them or evidence is attached. Self-reports never count as proof.",
  },
  {
    icon: <LineChart className="size-5" />,
    title: "Share a trusted profile",
    body: "A transparent prototype Financial Resilience Score and Income Confidence Score help a partner bank see the real earner.",
  },
];

const FACTORS = [
  { label: "Income consistency", weight: 25 },
  { label: "Verification confidence", weight: 18 },
  { label: "Savings behaviour", weight: 17 },
  { label: "Repayment behaviour", weight: 16 },
  { label: "Expense management", weight: 12 },
  { label: "Length of work history", weight: 12 },
];

const ROLES = [
  {
    icon: <Wallet className="size-5" />,
    role: "Worker",
    email: "ravi@demo.com",
    desc: "Mobile-first dashboard, resilience score, cash-income recording, adaptive savings and consent control.",
  },
  {
    icon: <Briefcase className="size-5" />,
    role: "Employer",
    email: "employer@demo.com",
    desc: "Confirm or reject income-verification requests from workers — turning cash wages into trusted records.",
  },
  {
    icon: <Building2 className="size-5" />,
    role: "Partner Bank",
    email: "bank@demo.com",
    desc: "View only consented worker profiles with verification status — better context for their own assessment.",
  },
];

const MARQUEE = [
  "Verified cash income",
  "Consent-first data sharing",
  "Transparent prototype scoring",
  "Adaptive savings",
  "Income volatility analytics",
  "Emergency fund planning",
  "Employer confirmations",
  "Responsible AI insights",
];

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <div className="dark-scroll min-h-dvh bg-ink-950 text-slate-200">
      {/* ---------------- Nav ---------------- */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-ink-950 shadow-glow">
              <Landmark className="size-4.5" />
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight text-white">
              Gig FinancialBridge
            </span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
            <a href="#problem" className="transition hover:text-white">The problem</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#score" className="transition hover:text-white">Scoring</a>
            <a href="#demo" className="transition hover:text-white">Live demo</a>
          </nav>
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                href={dashboardPath(user.role)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-emerald-400"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-emerald-400"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="hero-mesh relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(60rem_36rem_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pt-16 pb-14 sm:pt-24 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="stagger">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 text-[11.5px] font-semibold tracking-wide text-emerald-300">
              <Sparkles className="size-3.5" />
              FINTECH HACKATHON PROTOTYPE · SYNTHETIC DATA ONLY
            </div>
            <h1 className="mt-6 font-display text-[42px] leading-[1.02] font-bold tracking-[-0.03em] text-white sm:text-6xl lg:text-[68px]">
              Your income may be informal.{" "}
              <span className="text-gradient">Your financial identity shouldn&rsquo;t be invisible.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              FinancialBridge turns consented digital transactions, employer-verified cash
              wages, savings and repayment behaviour into a trusted alternative financial
              identity for gig workers, daily-wage earners and freelancers — the people
              banks can&rsquo;t see today.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                href={user ? dashboardPath(user.role) : "/login"}
                className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-glow transition hover:bg-emerald-400"
              >
                Explore the live demo
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#score"
                className="rounded-2xl border border-white/12 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/5"
              >
                See the scoring model
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-4 text-emerald-400" />
              Not a CIBIL score. Not a loan promise. A transparent prototype financial-resilience profile.
            </p>
          </div>

          {/* Hero score card */}
          <div className="relative animate-float">
            <div className="glass-dark rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    Financial Resilience Score
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Ravi Kumar · Delivery partner, Jaipur</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10.5px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
                  PROTOTYPE
                </span>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <ScoreRing score={748} max={900} size={208} dark />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-3.5">
                  <p className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                    Income confidence
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-emerald-300">89%</p>
                  <p className="text-[10.5px] text-slate-500">high verification support</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3.5">
                  <p className="text-[10.5px] font-semibold tracking-wider text-slate-400 uppercase">
                    Income consistency
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-white">82%</p>
                  <p className="text-[10.5px] text-slate-500">6-month variance</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 ring-1 ring-amber-400/20">
                <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
                <p className="text-[10.5px] leading-relaxed text-amber-200/90">
                  Prototype indicator only — not an official credit score and never a
                  guarantee of loan approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative border-y border-white/5 bg-white/[0.02] py-4">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                <span className="size-1.5 rounded-full bg-emerald-400/70" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Problem ---------------- */}
      <section id="problem" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">The problem</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-[40px] sm:leading-[1.1]">
              Financially active. <span className="text-slate-500">Financially invisible.</span>
            </h2>
            <p className="mt-5 leading-relaxed text-slate-400">
              A salaried employee has a financial identity — every month, their income
              appears in a bank account. A construction worker earning ₹800 a day in cash,
              or a delivery rider earning ₹35,000 one month and ₹18,000 the next, has no
              such proof. The earning capacity is real. The record of it isn&rsquo;t.
            </p>
            <p className="mt-4 leading-relaxed text-slate-400">
              The innovation here isn&rsquo;t another loan product or another CIBIL score.
              It is a <span className="font-semibold text-slate-200">trusted financial identity</span> for
              workers the formal system can&rsquo;t currently assess — built from data they
              own and consent to share.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PROBLEM_STATS.map((s) => (
              <div key={s.label} className="glass-dark rounded-2xl p-5">
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-slate-400">{s.label}</p>
              </div>
            ))}
            <div className="glass-dark rounded-2xl p-5 sm:col-span-3">
              <div className="flex items-start gap-3">
                <HandCoins className="mt-1 size-5 shrink-0 text-emerald-400" />
                <p className="text-sm leading-relaxed text-slate-300">
                  <span className="font-semibold text-white">Example:</span> a gig worker
                  earns ₹35,000 → ₹22,000 → ₹40,000 → ₹18,000 over four months. Volatile,
                  yes — but a real, consistent earning pattern that a consent-based profile
                  can make visible for the first time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="border-y border-white/5 bg-white/[0.015] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">How it works</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-[40px]">
            From invisible income to a profile a bank can read
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass-dark group relative rounded-2xl p-6">
                <span className="absolute top-5 right-5 font-display text-4xl font-bold text-white/8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25">
                  {s.icon}
                </span>
                <h3 className="mt-5 font-display text-[15px] font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Scoring ---------------- */}
      <section id="score" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">Transparent scoring</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-[40px] sm:leading-[1.12]">
              A prototype Financial Resilience Score — every factor explained
            </h2>
            <p className="mt-5 leading-relaxed text-slate-400">
              The 0–900 score is normalized from six transparent factors. Workers see
              exactly why their score is what it is, and a companion{" "}
              <span className="font-semibold text-slate-200">Income Confidence Score (0–100%)</span>{" "}
              shows how strongly the reported income is backed by verification.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <FileCheck2 className="mt-0.5 size-4.5 shrink-0 text-emerald-400" />
                Self-reported income → <span className="text-rose-300">low confidence</span>, never auto-trusted
              </li>
              <li className="flex gap-3">
                <PiggyBank className="mt-0.5 size-4.5 shrink-0 text-emerald-400" />
                Digital records / work evidence → <span className="text-amber-300">medium confidence</span>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-emerald-400" />
                Employer or payment verification → <span className="text-emerald-300">high confidence</span>
              </li>
            </ul>
          </div>
          <div className="glass-dark rounded-3xl p-7">
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              Factor weights · normalized to 900
            </p>
            <div className="mt-5 space-y-4">
              {FACTORS.map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-slate-300">{f.label}</span>
                    <span className="font-display font-bold text-emerald-300">{f.weight}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                      style={{ width: `${f.weight * 4}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-white/8 pt-4 text-[11px] leading-relaxed text-slate-500">
              Hackathon analytics prototype. A production deployment could implement this
              layer with Python (Pandas, NumPy, Scikit-learn, XGBoost) alongside a
              bank&rsquo;s own regulated models.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Demo roles ---------------- */}
      <section id="demo" className="border-t border-white/5 bg-white/[0.015] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">Live demo</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-[40px]">
            Three roles. One trust loop.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            Use the seeded demo accounts below (password for all:{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-emerald-300">demo123</code>).
            Record a cash wage as a worker, confirm it as the employer, then watch the
            worker&rsquo;s scores update — and see what the bank can view with consent.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.role} className="glass-dark flex flex-col rounded-2xl p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/8 text-emerald-300">
                  {r.icon}
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-white">{r.role}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">{r.desc}</p>
                <code className="mt-4 block rounded-lg bg-white/6 px-3 py-2 font-mono text-[12px] text-emerald-300">
                  {r.email}
                </code>
              </div>
            ))}
          </div>
          <div className="mt-9 flex justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-ink-950 shadow-glow transition hover:bg-emerald-400"
            >
              Sign in to the demo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-[12px] leading-relaxed text-slate-500 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 font-semibold text-slate-300">
              <Landmark className="size-4 text-emerald-400" /> Gig FinancialBridge
            </p>
            <p className="mt-2">
              Hackathon prototype running entirely on synthetic data. FinancialBridge is
              not a credit bureau and does not issue credit scores or guarantee lending
              outcomes. The Financial Resilience Score is an illustrative indicator only;
              any lending decision always belongs to the partner bank, based on its own
              assessment, policies and applicable regulations. In production, financial
              data would be accessed only through authorized, consent-based
              data-sharing mechanisms.
            </p>
          </div>
          <p className="shrink-0">Built for the fintech hackathon · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
