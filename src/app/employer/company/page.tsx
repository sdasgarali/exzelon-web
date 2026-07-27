import { DashHeader } from "@/components/dashboard/ui";
import { CompanyForm } from "@/components/dashboard/company-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/repo";
import type { CompanyProfile } from "@/lib/company";
import type { CompanyInput } from "@/lib/validation";

export default async function EmployerCompany() {
  const user = await getCurrentUser();
  const dbUser = await getUserById(user!.id);
  const profile = (dbUser?.companyProfile ?? {}) as CompanyProfile;

  const initial: CompanyInput = {
    company: dbUser?.company ?? "",
    tagline: profile.tagline ?? "",
    about: profile.about ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    size: profile.size ?? "",
    logoUrl: profile.logoUrl ?? "",
  };

  return (
    <>
      <DashHeader
        title="Company profile"
        subtitle="This is what candidates see on your public company page and job postings."
      />
      <CompanyForm initial={initial} companyId={user!.id} />
    </>
  );
}
