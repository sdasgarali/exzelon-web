import Image from "next/image";
import { cn } from "@/lib/utils";

const RATIO = 1036 / 401;

/**
 * Exzelon brand logo (real artwork, background removed).
 * `invert` swaps to the all-white variant for dark / periwinkle surfaces.
 * Size via `className` height (e.g. `h-9`); width follows the aspect ratio.
 */
export function Logo({
  className,
  invert = false,
  priority = false,
}: {
  className?: string;
  invert?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={invert ? "/brand/exzelon-logo-white.png" : "/brand/exzelon-logo.png"}
      alt="Exzelon — NextGen Hires"
      width={Math.round(36 * RATIO)}
      height={36}
      priority={priority}
      className={cn("h-9 w-auto select-none", className)}
    />
  );
}

/** Square mark only — for compact / square contexts. */
export function LogoMark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Image
      src={invert ? "/brand/exzelon-mark-white.png" : "/brand/exzelon-mark.png"}
      alt="Exzelon"
      width={36}
      height={36}
      className={cn("h-9 w-9 select-none", className)}
    />
  );
}
