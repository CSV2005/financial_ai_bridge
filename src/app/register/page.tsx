import Link from "next/link";
import { Landmark, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/actions";

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-slate-50 px-5 py-10">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Landmark className="size-4" />
          </span>
          <span className="font-display text-sm font-bold text-slate-900">Gig FinancialBridge</span>
        </Link>

        <h1 className="mt-8 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Choose your role to begin. Workers can build a financial identity; employers
          verify informal income; partner banks view only consented profiles.
        </p>

        <div className="card mt-6 p-6">
          <RegisterForm />
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
        <p className="mt-6 flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-slate-400">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Demo environment with synthetic data only. Never enter real banking credentials.
        </p>
      </div>
    </div>
  );
}
