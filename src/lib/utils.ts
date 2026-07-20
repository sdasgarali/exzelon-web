import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with thousands separators. */
export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Human-friendly relative time, e.g. "2 days ago". Accepts Date or ISO string. */
export function timeAgo(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60, "minute"],
    [3600, "hour"],
    [86400, "day"],
    [604800, "week"],
    [2592000, "month"],
    [31536000, "year"],
  ];
  let value = seconds;
  let label = "second";
  for (let i = units.length - 1; i >= 0; i--) {
    if (seconds >= units[i][0]) {
      value = Math.floor(seconds / units[i][0]);
      label = units[i][1];
      break;
    }
  }
  return `${value} ${label}${value === 1 ? "" : "s"} ago`;
}
