import { DashHeader } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";
import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/repo";
import { isProfileComplete, profileMissingFields, type SeekerProfile } from "@/lib/profile";
import type { ProfileInput } from "@/lib/validation";

export default async function Profile() {
  const user = await getCurrentUser();
  const dbUser = await getUserById(user!.id);
  const profile = (dbUser?.profile ?? {}) as SeekerProfile;
  const account = { name: user!.name, email: user!.email };
  const complete = isProfileComplete({ ...account, profile });
  const missing = profileMissingFields({ ...account, profile });

  const initial: ProfileInput = {
    resumeUrl: profile.resumeUrl ?? "",
    linkedin: profile.linkedin ?? "",
    otherLink: profile.otherLink ?? "",
    phone: profile.phone ?? "",
    experienceLevel: profile.experienceLevel,
    experiences: profile.experiences ?? [],
    education: profile.education ?? [],
  };

  return (
    <>
      <DashHeader title="Profile" subtitle="Complete your profile so you can apply to jobs." />
      <div className="max-w-2xl">
        {complete ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <Icon name="badge-check" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-800">Your profile is ready</p>
              <p className="text-emerald-700">You can apply to any open role.</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Finish your profile to apply</p>
              <p className="text-amber-700">Still needed: {missing.join(", ")}.</p>
            </div>
          </div>
        )}

        <ProfileForm account={account} initial={initial} />
      </div>
    </>
  );
}
