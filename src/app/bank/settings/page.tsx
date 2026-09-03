import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card, PrototypeNote } from "@/components/ui";
import { SettingsForm } from "@/components/actions";

export default async function BankSettingsPage() {
  const user = await requireUser("bank");
  const [profile] = await db
    .select()
    .from(bankProfiles)
    .where(eq(bankProfiles.userId, user.id))
    .limit(1);

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage your partner-bank profile." />
      <SettingsForm
        role="bank"
        defaults={{ name: user.name, bankName: profile?.bankName ?? "" }}
      />
      <Card>
        <h3 className="font-display text-[15px] font-semibold text-slate-900">Account</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p><span className="text-slate-400">Email:</span> {user.email}</p>
          <p><span className="text-slate-400">Role:</span> Partner Bank</p>
        </div>
      </Card>
      <PrototypeNote />
    </div>
  );
}
