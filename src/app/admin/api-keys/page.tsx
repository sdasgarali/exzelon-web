import { DashHeader } from "@/components/dashboard/ui";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Admin page to mint the analytics API key AccessHub uses to pull Exzelon's visitor data. */
export default function AdminApiKeysPage() {
  const endpoint = `${site.url}/api/v1/analytics`;
  return (
    <div>
      <DashHeader
        title="Analytics API"
        subtitle="Expose Exzelon's first-party visitor analytics so AccessHub (or any system) can pull it."
      />
      <ApiKeysManager endpoint={endpoint} source="exz-web" />
    </div>
  );
}
