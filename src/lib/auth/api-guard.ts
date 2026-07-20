import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser, type Role } from "./session";

/**
 * Guard for Route Handlers. Returns either the authenticated user or a ready
 * NextResponse to short-circuit with (401/403).
 *
 * Usage:
 *   const guard = await requireApiUser(["admin"]);
 *   if ("error" in guard) return guard.error;
 *   const { user } = guard;
 */
export async function requireApiUser(
  roles?: Role[]
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}
