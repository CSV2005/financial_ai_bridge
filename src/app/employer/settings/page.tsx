import { eq } from "drizzle-orm";
import { db } from "@/db";
import { employerProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, InfoNote } from "@/components/ui";
import { SettingsForm } from "@/components/actions";

export default async function EmployerSettingsPage() {
  const user = await requireUser("employer");
  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, user.id))
    .limit(1);

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage your company profile." />
      <SettingsForm
        role="employer"
        defaults={{
          name: user.name,
          companyName: profile?.companyName ?? "",
          industry: profile?.industry ?? "",
        }}
      />
      <Card>
        <h3 className="font-display text-[15px] font-semibold text-slate-900">Account</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p><span className="text-slate-400">Email:</span> {user.email}</p>
          <p><span className="text-slate-400">Role:</span> Employer</p>
        </div>
      </Card>
      <InfoNote>
        FinancialBridge is a hackathon prototype. In production, employer verifications
        would be tied to authenticated business identities and auditable payment records.
      </InfoNote>
    </div>
  );
}
