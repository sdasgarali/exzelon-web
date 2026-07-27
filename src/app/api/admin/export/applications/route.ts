import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { listApplications } from "@/lib/db/repo";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;

  const apps = await listApplications();
  const rows = apps.map((a) => ({
    name: a.name,
    email: a.email,
    phone: a.phone ?? "",
    jobTitle: a.jobTitle,
    status: a.status,
    experienceLevel: a.experienceLevel ?? "",
    resume: a.resumeFileId ? `file:${a.resumeFileId}` : a.resumeUrl ?? "",
    appliedAt: a.createdAt,
  }));

  const csv = toCsv(rows, [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "jobTitle", header: "Role" },
    { key: "status", header: "Status" },
    { key: "experienceLevel", header: "Experience" },
    { key: "resume", header: "Resume" },
    { key: "appliedAt", header: "Applied At" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="applications.csv"',
    },
  });
}
