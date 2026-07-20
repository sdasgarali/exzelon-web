import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession, type Role } from "@/lib/auth/jwt";

/** Route prefix → the role required to access it. */
const GUARDS: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/employer", role: "employer" },
  { prefix: "/account", role: "seeker" },
];

const HOME_FOR: Record<Role, string> = {
  admin: "/admin",
  employer: "/employer",
  seeker: "/account",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySession(token) : null;

  // Authenticated users shouldn't sit on the auth pages.
  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(HOME_FOR[user.role], req.url));
  }

  const guard = GUARDS.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`));
  if (!guard) return NextResponse.next();

  // Not logged in → send to login, remembering where they were headed.
  if (!user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in but wrong role → bounce to their own dashboard.
  if (user.role !== guard.role) {
    return NextResponse.redirect(new URL(HOME_FOR[user.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employer/:path*", "/account/:path*", "/login", "/register"],
};
