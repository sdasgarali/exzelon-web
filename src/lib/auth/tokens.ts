import "server-only";
import { randomBytes, createHash } from "crypto";

/**
 * Single-use token helpers for email verification & password reset.
 * The raw token is emailed to the user; only its SHA-256 hash is stored in the DB,
 * so a database leak alone can't be used to verify emails or reset passwords.
 */

export const VERIFY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
export const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h

/** Generate a random URL-safe token plus its storable hash and expiry. */
export function createToken(ttlMs: number) {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashToken(token), expires: new Date(Date.now() + ttlMs) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
