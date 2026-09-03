import Link from "next/link";
import { Landmark, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/actions";

const DEMO_ACCOUNTS = [
  { role: "Worker", email: "ravi@demo.com" },
  { role: "Worker 2", email: "meena@demo.com" },
  { role: "Employer", email: "employer@demo.com" },
  { role: "Partner Bank", email: "bank@demo.com" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <div className="hero-mesh relative hidden flex-col justify-between bg-ink-950 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-ink-950">
            <Landmark className="size-4.5" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Gig FinancialBridge
          </span>
        </Link>
        <div>
          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-white">
            Your income may be informal.{" "}
            <span className="text-gradient">Your financial identity shouldn&rsquo;t be invisible.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Sign in to explore the worker, employer and partner-bank experiences with
            fully synthetic demo data.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">
            Demo accounts · password <span className="text-emerald-300">demo123</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <div key={a.email} className="rounded-xl bg-white/6 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-slate-300">{a.role}</p>
                <p className="font-mono text-[11.5px] text-emerald-300">{a.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Landmark className="size-4" />
            </span>
            <span className="font-display text-sm font-bold text-slate-900">Gig FinancialBridge</span>
          </Link>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your FinancialBridge account.
          </p>
          <div className="card mt-6 p-6">
            <LoginForm />
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            New here?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create an account
            </Link>
          </p>
          <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-slate-400">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            This prototype never asks for real banking passwords, PINs or OTPs.
          </p>
        </div>
      </div>
    </div>
  );
}
