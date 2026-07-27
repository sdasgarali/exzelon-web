import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { listUsers } from "@/lib/db/repo";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;

  const users = await listUsers();
  const rows = users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    company: u.company ?? "",
    emailVerified: u.emailVerified ? "yes" : "no",
    joinedAt: u.createdAt,
  }));

  const csv = toCsv(rows, [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "company", header: "Company" },
    { key: "emailVerified", header: "Email Verified" },
    { key: "joinedAt", header: "Joined At" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="users.csv"',
    },
  });
}
