import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-ink-900 px-6 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="relative">
        <p className="display-1 font-extrabold text-gradient">404</p>
        <h1 className="display-2 mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-brand-100/80">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="accent" size="lg">
            Back home <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/jobs" variant="light" size="lg">Browse jobs</ButtonLink>
        </div>
      </div>
    </section>
  );
}
