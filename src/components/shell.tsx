"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Landmark, LogOut, Menu, X } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function AppShell({
  userName,
  roleLabel,
  nav,
  children,
}: {
  userName: string;
  roleLabel: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const primary = nav.slice(0, 4);

  return (
    <div className="min-h-dvh bg-slate-100">
      {/* ------- Desktop sidebar ------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 pt-6 pb-7">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Landmark className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold tracking-tight text-slate-900">
              FinancialBridge
            </span>
            <span className="block text-[10.5px] font-medium tracking-[0.14em] text-emerald-600 uppercase">
              {roleLabel}
            </span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`[&>svg]:size-[18px] ${
                  isActive(item.href) ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive(item.href) && (
                <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 font-display text-xs font-bold text-white">
              {userName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-[11px] text-slate-400">{roleLabel}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------- Mobile top bar ------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Landmark className="size-4" />
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-slate-900">
            FinancialBridge
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
            {userName.split(" ")[0]}
          </span>
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* ------- Mobile slide-over menu ------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="font-display text-sm font-bold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-400">{roleLabel}</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`[&>svg]:size-[18px] ${
                      isActive(item.href) ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 p-3">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="size-[18px]" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------- Content ------- */}
      <main className="px-4 pt-5 pb-28 sm:px-6 md:pl-72 md:pr-8 md:pt-7 md:pb-12 lg:pr-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* ------- Mobile bottom tab bar ------- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
                isActive(item.href) ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <span className="[&>svg]:size-5">{item.icon}</span>
              {item.label.split(" ")[0]}
            </Link>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${
              menuOpen ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <Menu className="size-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  );
}
