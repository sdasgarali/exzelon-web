"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon name="x" className="h-8 w-8" />
        </span>
        <h1 className="display-2 mt-6 text-3xl font-bold text-ink-900">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} variant="primary" size="lg">Try again</Button>
          <ButtonLink href="/" variant="outline" size="lg">Back home</ButtonLink>
        </div>
      </div>
    </section>
  );
}
