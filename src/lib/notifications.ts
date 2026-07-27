import "server-only";
import {
  sendNotificationEmail,
  emailLayout,
  emailButton,
  siteBaseUrl,
  escapeHtml,
} from "@/lib/email";

/**
 * Application-lifecycle transactional emails. All are best-effort — callers
 * should not fail the request if delivery fails (wrap in try/catch or ignore
 * the returned promise). Falls back to the dev console logger without a key.
 */

/** Confirmation to the seeker that their application was received. */
export async function sendApplicationConfirmation(opts: {
  to: string;
  name: string;
  jobTitle: string;
}) {
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">Application received</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      Hi ${escapeHtml(opts.name || "there")}, thanks for applying to
      <strong>${escapeHtml(opts.jobTitle)}</strong>. Your application has been submitted and the
      hiring team will review it. You can track its status anytime from your dashboard.
    </p>
    <p style="margin:0 0 8px">${emailButton(`${siteBaseUrl()}/account/applications`, "View my applications")}</p>
  `);
  return sendNotificationEmail({ to: opts.to, subject: `Application received — ${opts.jobTitle}`, html });
}

/** Alert to the employer that a new candidate applied to one of their jobs. */
export async function sendEmployerNewApplication(opts: {
  to: string;
  applicantName: string;
  jobTitle: string;
  jobSlug: string;
}) {
  const link = `${siteBaseUrl()}/employer/jobs/${opts.jobSlug}/applicants`;
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">New application</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      <strong>${escapeHtml(opts.applicantName)}</strong> just applied to your role
      <strong>${escapeHtml(opts.jobTitle)}</strong>.
    </p>
    <p style="margin:0 0 8px">${emailButton(link, "Review applicants")}</p>
  `);
  return sendNotificationEmail({ to: opts.to, subject: `New applicant — ${opts.jobTitle}`, html });
}

const STATUS_COPY: Record<string, { subject: string; heading: string; body: string }> = {
  reviewed: {
    subject: "Your application is under review",
    heading: "Your application is under review",
    body: "The hiring team has started reviewing your application. We'll keep you posted as things progress.",
  },
  shortlisted: {
    subject: "Good news — you've been shortlisted",
    heading: "You've been shortlisted 🎉",
    body: "Great news! You've been shortlisted for this role. The team may reach out with next steps soon.",
  },
  rejected: {
    subject: "Update on your application",
    heading: "Update on your application",
    body: "Thanks for your interest. After careful review, the team has decided to move forward with other candidates for this role. We wish you the best and encourage you to apply to future openings.",
  },
};

/** Notify the seeker when their application status changes to a meaningful state. */
export async function sendApplicationStatusEmail(opts: {
  to: string;
  name: string;
  jobTitle: string;
  status: string;
}) {
  const copy = STATUS_COPY[opts.status];
  if (!copy) return { ok: true, delivered: false }; // "new" or unknown → no email
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">${copy.heading}</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      Hi ${escapeHtml(opts.name || "there")}, there's an update on your application for
      <strong>${escapeHtml(opts.jobTitle)}</strong>.
    </p>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">${copy.body}</p>
    <p style="margin:0 0 8px">${emailButton(`${siteBaseUrl()}/account/applications`, "View my applications")}</p>
  `);
  return sendNotificationEmail({ to: opts.to, subject: `${copy.subject} — ${opts.jobTitle}`, html });
}
