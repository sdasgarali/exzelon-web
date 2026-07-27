import Link from "next/link";
import { cn } from "@/lib/utils";

/** Server-rendered pagination that preserves the current filters in the query string. */
export function JobsPagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 && (
        <Link href={href(page - 1)} scroll className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700">
          Prev
        </Link>
      )}
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-slate-400">…</span>}
            <Link
              href={href(p)}
              scroll
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "rounded-lg border px-3.5 py-2 text-sm font-medium",
                p === page
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-sand-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages && (
        <Link href={href(page + 1)} scroll className="rounded-lg border border-sand-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700">
          Next
        </Link>
      )}
    </nav>
  );
}
