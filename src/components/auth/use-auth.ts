"use client";

import { useEffect, useState } from "react";

export type ClientUser = { id: string; name: string; email: string; role: "admin" | "employer" | "seeker" };

export const HOME_FOR: Record<string, string> = { admin: "/admin", employer: "/employer", seeker: "/account" };

/** Fetches the current session user from /api/auth/me. */
export function useAuth() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (active) setUser(d.user ?? null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}
