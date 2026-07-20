import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Pure JWT helpers with NO Node/`next/headers` dependencies, so this module is
 * safe to import from the Edge middleware runtime as well as route handlers.
 */

export const SESSION_COOKIE = "exz_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "admin" | "employer" | "seeker";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload?.id || !payload?.role) return null;
    return {
      id: String(payload.id),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
