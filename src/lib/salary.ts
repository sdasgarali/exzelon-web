/**
 * Best-effort parser that turns a human salary string into an approximate annual
 * USD min/max, so jobs stay filterable by pay without changing the employer form.
 * Handles: "$85k–$105k", "$45–$60/hr", "$120,000", "Up to $90k", "Competitive".
 * Shared (client + server) — used at write time and for the public salary filter.
 */

const HOURS_PER_YEAR = 2080; // 40h * 52w

export function parseSalary(input: string | undefined | null): { min?: number; max?: number } {
  if (!input) return {};
  const text = input.toLowerCase();
  const hourly = /\/\s*(hr|hour)|per hour|hourly/.test(text);

  // Pull numbers, honoring a trailing "k" (thousands) on each.
  const matches = [...text.matchAll(/(\d[\d,]*\.?\d*)\s*(k)?/g)];
  const nums: number[] = [];
  for (const m of matches) {
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (Number.isNaN(n)) continue;
    if (m[2] === "k") n *= 1000;
    if (hourly && n < 1000) n *= HOURS_PER_YEAR; // annualize hourly rates
    nums.push(Math.round(n));
  }
  if (nums.length === 0) return {};
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { min, max };
}
