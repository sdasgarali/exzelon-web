import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { JobCard } from "@/components/cards/job-card";
import { CtaBanner } from "@/components/cta-banner";
import { getUserById, listPublicJobsByOwner } from "@/lib/db/repo";
import { industryCountWord } from "@/content/industries";
import { pageMetadata } from "@/lib/seo";
import type { CompanyProfile } from "@/lib/company";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user || user.role !== "employer") return pageMetadata({ title: "Company" });
  const p = (user.companyProfile ?? {}) as CompanyProfile;
  return pageMetadata({
    title: user.company || "Company",
    description: p.tagline || p.about?.slice(0, 150) || `Open roles at ${user.company}.`,
    path: `/companies/${id}`,
  });
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user || user.role !== "employer") notFound();

  const p = (user.companyProfile ?? {}) as CompanyProfile;
  const jobs = await listPublicJobsByOwner(id);
  const name = user.company || user.name;

  return (
    <>
      <PageHeader
        eyebrow="Company"
        crumbs={[{ label: "Jobs", href: "/jobs" }, { label: name }]}
        title={name}
        description={p.tagline || `Explore open roles at ${name}.`}
      >
        <span className="flex flex-wrap gap-2 text-sm text-white/80">
          {p.location && (
            <span className="inline-flex items-center gap-1.5"><Icon name="map-pin" className="h-4 w-4" /> {p.location}</span>
          )}
          {p.size && (
            <span className="inline-flex items-center gap-1.5"><Icon name="users" className="h-4 w-4" /> {p.size} employees</span>
          )}
          {p.website && (
            <a href={p.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="external-link" className="h-4 w-4" /> Website
            </a>
          )}
        </span>
      </PageHeader>

      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            {p.logoUrl && (
              <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-sand-200 bg-white">
                {/* Employer-supplied URL — unoptimized to avoid remote-loader config. */}
                <Image src={p.logoUrl} alt={`${name} logo`} width={72} height={72} className="object-contain" unoptimized />
              </div>
            )}
            <h2 className="text-lg font-bold text-ink-900">About {name}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
              {p.about || "This company hasn't added a description yet."}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ink-900">
              Open roles <span className="text-slate-400">({jobs.length})</span>
            </h2>
            {jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-10 text-center text-sm text-slate-500">
                No open roles right now. Check back soon.
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CtaBanner
        title="Hiring like this?"
        subtitle={`Post your roles on Exzelon and reach qualified candidates across ${industryCountWord} industries.`}
        primary={{ label: "For Employers", href: "/for-clients" }}
        secondary={{ label: "Browse all jobs", href: "/jobs" }}
      />
    </>
  );
}
