import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/db/repo";
import type { ApiKeyScope } from "@/lib/db/models";

/** CORS for the public, key-authenticated /api/v1 surface. */
export const API_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function apiKeyError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: API_CORS });
}

/**
 * Guard for the key-authenticated /api/v1 endpoints. Reads `Authorization: Bearer <key>`,
 * validates it, and (optionally) enforces a scope.
 *   const guard = await requireApiKey(req, "posts:write");
 *   if ("error" in guard) return guard.error;
 *   const { key } = guard;   // { name, scopes }
 */
export async function requireApiKey(
  req: Request,
  scope?: ApiKeyScope
): Promise<{ key: { name: string; scopes: ApiKeyScope[] } } | { error: NextResponse }> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return { error: apiKeyError("Missing API key. Pass: Authorization: Bearer <your-key>", 401) };
  }
  const key = await validateApiKey(token);
  if (!key) return { error: apiKeyError("Invalid or revoked API key", 401) };
  if (scope && !key.scopes.includes(scope)) {
    return { error: apiKeyError(`API key is missing the required scope: ${scope}`, 403) };
  }
  return { key };
}
