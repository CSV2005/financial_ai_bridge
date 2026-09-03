import type { ReactNode } from "react";
import {
  LayoutDashboard,
  UserRound,
  ArrowLeftRight,
  HandCoins,
  Banknote,
  PiggyBank,
  LifeBuoy,
  Sparkles,
  Link2,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell";
import { requireUser } from "@/lib/auth";

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/profile", label: "Financial Profile", icon: <UserRound /> },
  { href: "/transactions", label: "Transactions", icon: <ArrowLeftRight /> },
  { href: "/income", label: "Income", icon: <HandCoins /> },
  { href: "/cash-income", label: "Cash Income", icon: <Banknote /> },
  { href: "/savings", label: "Savings", icon: <PiggyBank /> },
  { href: "/emergency-fund", label: "Emergency Fund", icon: <LifeBuoy /> },
  { href: "/insights", label: "Financial Insights", icon: <Sparkles /> },
  { href: "/connect", label: "Connect Accounts", icon: <Link2 /> },
  { href: "/consent", label: "Consent", icon: <ShieldCheck /> },
  { href: "/settings", label: "Settings", icon: <Settings /> },
];

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("worker");
  return (
    <AppShell userName={user.name} roleLabel="Worker" nav={NAV}>
      {children}
    </AppShell>
  );
}
