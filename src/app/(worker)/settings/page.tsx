import { requireUser } from "@/lib/auth";
import { getWorkerProfile } from "@/lib/data";
import { PageHeader, Card, PrototypeNote } from "@/components/ui";
import { SettingsForm } from "@/components/actions";

export default async function WorkerSettingsPage() {
  const user = await requireUser("worker");
  const profile = await getWorkerProfile(user.id);

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Manage your worker profile and account details." />
      <SettingsForm
        role="worker"
        defaults={{
          name: user.name,
          workerType: profile?.workerType ?? "gig",
          city: profile?.city ?? "",
          primaryPlatform: profile?.primaryPlatform ?? "",
          workStartDate: profile?.workStartDate ?? "",
          phone: profile?.phone ?? "",
        }}
      />
      <Card>
        <h3 className="font-display text-[15px] font-semibold text-slate-900">Account</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <p><span className="text-slate-400">Email:</span> {user.email}</p>
          <p><span className="text-slate-400">Role:</span> Worker</p>
        </div>
      </Card>
      <PrototypeNote />
    </div>
  );
}
