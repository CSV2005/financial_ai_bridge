import type { ReactNode } from "react";
import { LayoutDashboard, FileCheck2, Users, IndianRupee, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/db";
import { employerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const NAV: NavItem[] = [
  { href: "/employer/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/employer/verifications", label: "Verification Requests", icon: <FileCheck2 /> },
  { href: "/employer/workers", label: "Workers", icon: <Users /> },
  { href: "/employer/payments", label: "Payment History", icon: <IndianRupee /> },
  { href: "/employer/settings", label: "Settings", icon: <Settings /> },
];

export default async function EmployerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("employer");
  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);
  return (
    <AppShell userName={profile?.companyName ?? user.name} roleLabel="Employer" nav={NAV}>
      {children}
    </AppShell>
  );
}
