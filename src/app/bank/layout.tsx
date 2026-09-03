import type { ReactNode } from "react";
import { LayoutDashboard, Users, ShieldCheck, ClipboardList, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const NAV: NavItem[] = [
  { href: "/bank/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/bank/profiles", label: "Worker Profiles", icon: <Users /> },
  { href: "/bank/consented-data", label: "Consented Data", icon: <ShieldCheck /> },
  { href: "/bank/assessment", label: "Financial Assessment", icon: <ClipboardList /> },
  { href: "/bank/settings", label: "Settings", icon: <Settings /> },
];

export default async function BankLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);
  return (
    <AppShell userName={profile?.bankName ?? user.name} roleLabel="Partner Bank" nav={NAV}>
      {children}
    </AppShell>
  );
}
