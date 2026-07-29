import { DashHeader } from "@/components/dashboard/ui";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Admin page to mint the API keys AccessHub uses to pull analytics and manage the blog. */
export default function AdminApiKeysPage() {
  const endpoint = `${site.url}/api/v1/analytics`;
  const postsEndpoint = `${site.url}/api/v1/posts`;
  return (
    <div>
      <DashHeader
        title="API access"
        subtitle="Expose Exzelon's visitor analytics and blog content so AccessHub (or any system) can connect."
      />
      <ApiKeysManager endpoint={endpoint} source="exz-web" postsEndpoint={postsEndpoint} />
    </div>
  );
}
