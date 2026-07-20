import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-[var(--ease-out-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-600 text-white shadow-[0_10px_30px_-12px_rgba(26,84,224,0.7)] hover:bg-brand-700 hover:shadow-[0_16px_40px_-14px_rgba(26,84,224,0.85)] hover:-translate-y-0.5",
        accent:
          "bg-accent-500 text-ink-900 shadow-[0_10px_30px_-12px_rgba(240,140,0,0.6)] hover:bg-accent-400 hover:-translate-y-0.5",
        outline:
          "border border-sand-300 bg-white/70 text-ink-900 hover:border-brand-400 hover:bg-brand-50 hover:-translate-y-0.5",
        ghost: "text-ink-800 hover:bg-brand-50 hover:text-brand-700",
        light:
          "bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/20 hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base py-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type BaseProps = VariantProps<typeof buttonVariants> & { className?: string };

export function Button({
  className,
  variant,
  size,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: BaseProps & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
