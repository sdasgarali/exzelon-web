import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * A short-lived signed cookie that ties the browser to its in-escrow signup
 * (a pendingRegistrations _id) while the user enters their OTP. Signed so the id
 * can't be forged; httpOnly so it's not readable from JS. Holds no PII.
 */

const PENDING_COOKIE = "exz_pending";
const PENDING_MAX_AGE = 60 * 60; // 1h — matches the pending-registration TTL

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  return new TextEncoder().encode(secret);
}

export async function createPendingCookie(pendingId: string) {
  const token = await new SignJWT({ pid: pendingId } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MAX_AGE}s`)
    .sign(getSecret());
  const store = await cookies();
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_MAX_AGE,
  });
}

/** Read + verify the pending-registration id from the cookie, or null. */
export async function readPendingId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload?.pid ? String(payload.pid) : null;
  } catch {
    return null;
  }
}

export async function clearPendingCookie() {
  const store = await cookies();
  store.set(PENDING_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
