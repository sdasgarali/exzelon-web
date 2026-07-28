import "server-only";
import { randomBytes, createHash } from "crypto";

/**
 * Single-use token helpers for email verification & password reset.
 * The raw token is emailed to the user; only its SHA-256 hash is stored in the DB,
 * so a database leak alone can't be used to verify emails or reset passwords.
 */

export const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
export const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h
export const VERIFY_OTP_TTL_MS = 1000 * 60 * 15; // 15m

/** Generate a random URL-safe token plus its storable hash and expiry. */
export function createToken(ttlMs: number) {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashToken(token), expires: new Date(Date.now() + ttlMs) };
}

/**
 * Generate a 6-digit numeric OTP plus its storable hash and expiry.
 * Uses rejection sampling so all 10^6 codes are equally likely (no modulo bias).
 * Only the hash is stored; the plaintext code is emailed to the user.
 */
export function createOtp(ttlMs: number) {
  let n: number;
  do {
    n = randomBytes(4).readUInt32BE(0);
  } while (n >= 4_000_000_000); // largest multiple of 1_000_000 below 2^32 (4_294_967_296)
  const code = String(n % 1_000_000).padStart(6, "0");
  return { code, hash: hashToken(code), expires: new Date(Date.now() + ttlMs) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
