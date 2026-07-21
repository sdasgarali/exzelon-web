# Feature: Gated job applications + richer seeker profile

## Goal
A visitor can browse jobs freely, but to **apply** they must (1) be signed in as a seeker
and (2) have a **complete profile**. The profile gains resume/social/experience/education fields,
with an experienced-vs-fresher branch that shows a LinkedIn-style experience list.

## Requirements → decisions
Profile fields and which are **required to apply** (a "complete" profile):

**DECISION (confirmed): gate on the 3 basics only.** A profile is "complete" (can apply) when
name + email + resume link are present. Everything else is collected but never blocks applying.

| Field | Blocks apply? | Notes |
|---|---|---|
| Full name | ✅ required | already on the account (UserDoc.name) |
| Email | ✅ required | already on the account (UserDoc.email) |
| Resume link (URL) | ✅ required | the one gating field on the profile |
| Experience level | ⬜ collected, optional | radio: `fresher` \| `experienced` |
| Experience entries | ⬜ collected, optional | LinkedIn-style: title, company, start, end/current, notes |
| Education qualification | ⬜ collected, optional | school, qualification, field, start/end |
| LinkedIn URL | ⬜ optional | |
| Other social/portfolio link | ⬜ optional | |
| Phone | ⬜ optional | was required on the old apply form; relaxed |

So `isProfileComplete` = `name && email && profile.resumeUrl`.

## Data model (src/lib/db/models.ts)
Extend `UserDoc` with an optional `profile`:
```ts
type Experience = { title: string; company: string; start: string; end?: string; current?: boolean; summary?: string };
type Education  = { school: string; qualification: string; field?: string; start?: string; end?: string };
profile?: {
  resumeUrl?: string;
  linkedin?: string;
  otherLink?: string;
  phone?: string;
  experienceLevel?: "fresher" | "experienced";
  experiences?: Experience[];
  education?: Education[];
  updatedAt?: Date;
};
```
`ApplicationDoc`: add optional `experienceLevel?: "fresher" | "experienced"`; make `phone` optional.

## Validation (src/lib/validation.ts) + src/lib/profile.ts
- `profileSchema` (zod) with `experiences`/`education` arrays; `.superRefine` → experienced ⇒ ≥1 experience.
- `isProfileComplete(user)` helper in **src/lib/profile.ts** (NOT server-only — shared client+server):
  returns boolean + list of missing items.
- `applySchema` shrinks to `{ jobId, jobTitle, coverLetter?, company_website? }` — identity/resume now
  come from the authenticated profile, not the form.

## Repo (src/lib/db/repo.ts)
- `updateUserProfile(userId, profile)` — `$set: { profile: {...profile, updatedAt} }`.
- `getUserById` already returns the full doc (used to read profile).

## API
- **NEW** `GET/PUT /api/account/profile` (seeker-guarded):
  - `GET` → `{ profile, complete, missing }`.
  - `PUT` → validate with `profileSchema`, persist, return `{ ok, complete, missing }`.
- **REWRITE** `POST /api/apply`:
  - `requireApiUser(["seeker"])` → 401 if anon, 403 if employer/admin.
  - Load dbUser; if `!isProfileComplete` → `422 { error, code: "profile_incomplete" }`.
  - Build the application from the **profile** (name/email/resume/linkedin/phone/experienceLevel) +
    the job + optional coverLetter. Keep the email notification + rate limit.

## UI
- **NEW** `src/components/account/profile-form.tsx` (client, react-hook-form + `useFieldArray`):
  resume, links, fresher/experienced radio, experience cards (add/remove), education cards, save.
  LinkedIn-style repeatable entries. Respects existing field primitives + motion.
- **REWRITE** `src/app/account/profile/page.tsx` → server-loads profile, renders `<ProfileForm>` +
  a completeness banner.
- **NEW** `src/components/forms/apply-panel.tsx` (client, auth-aware) replaces `<ApplyForm>` on the
  job page. States: loading → (anon) Sign in / Create account → (employer/admin) not-applicable →
  (seeker, incomplete) Complete your profile CTA → (seeker, complete) resume summary + cover note +
  Submit. Keeps the success animation.
- Job detail page swaps `<ApplyForm>` → `<ApplyPanel>`.
- Register: seeker signup redirects to `/account/profile` (finish profile) instead of `/account`.

## Admin/employer surfaces
Applicant lists already read name/email/phone/linkedin/resumeUrl from `ApplicationDoc` (snapshot at
apply time) — still populated, so no break. Optionally surface `experienceLevel`.

## Verification
- `npx tsc --noEmit` + `npm run lint` clean.
- Manual (dev + Playwright): anon apply → sign-in prompt; seeker w/ empty profile → "complete profile";
  fill profile (fresher & experienced paths) → apply succeeds → shows in /admin applications &
  /account/applications. Direct `POST /api/apply` while anon → 401; incomplete → 422 code.

## Out of scope
Resume file upload (link only), profile photo, editing name/email (stay account-level).
