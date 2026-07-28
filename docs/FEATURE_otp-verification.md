# Feature — OTP email verification (alongside existing link)

## Goal
New users verify their email via **either** a 6-digit OTP code **or** the existing magic link —
both delivered in the same verification email. Forgot-**password** already exists and stays as-is.

## Current state (already built)
- Register → `issueAndSendVerification` → link email → `/verify-email?token=` auto-verifies.
- `UserDoc`: `emailVerified`, `verifyTokenHash/Expires`, `resetTokenHash/Expires`.
- Resend banner on `/account` + `/employer` → `POST /api/auth/resend-verification`.
- Forgot/reset password: `/forgot-password` → email link → `/reset-password`. **DONE — no change.**

## Design
- Email now shows a prominent **6-digit code** + the existing **Verify email** button.
- OTP: numeric, 6 digits, **15-min** TTL. Stored as sha256 hash (never plaintext), like the link token.
- OTP verification is **scoped to the signed-in user** (from session) — no email in the request body,
  so no account enumeration and brute-force is per-account + rate-limited.
- Link token unchanged (24h, unauthenticated) — clicking still works from any device.
- Either path clears BOTH the token and the OTP and sets `emailVerified: true`.

## Slices
1. **tokens.ts** — add `VERIFY_OTP_TTL_MS = 15m` + `createOtp()` (6-digit code + `hashToken` hash + expiry).
2. **models.ts** — add `verifyOtpHash?: string`, `verifyOtpExpires?: Date` to `UserDoc`.
3. **repo.ts** — `setVerifyCredentials(id, {tokenHash,tokenExpires,otpHash,otpExpires})` (replaces
   `setVerifyToken`'s single caller); `verifyEmailByOtp(userId, otpHash)` → match by `_id` + hash +
   not-expired → set verified, clear token+otp. Keep `verifyEmailByTokenHash`.
4. **email-flows.ts** — `issueAndSendVerification` issues token **and** OTP, stores both, renders the
   code + the link in the email.
5. **validation.ts** — `otpSchema` (`otp: 6-digit string`).
6. **/api/auth/verify-email** — accept `{token}` (unauth, existing) **or** `{otp}` (requires session →
   `verifyEmailByOtp(currentUser.id, hash)`). Same rate limit.
7. **verify-email-client.tsx** — if `?token=` present, auto-verify (existing). Else render a 6-digit
   **OTP entry form** that POSTs `{otp}`; on success → verified + continue.
8. **verify-email-banner.tsx** — add an "Enter code →" link to `/verify-email`; button label "Resend email".
9. **(UX fork — see below)** post-register redirect.

## UX fork (needs decision)
- **A (recommended):** after signup, redirect to `/verify-email?next=<dashboard/profile>`; user enters
  the OTP immediately, then continues. Most explicit "verify on register" flow.
- **B:** keep current redirect (seeker→profile, employer→dashboard); rely on the banner + verify page.
  Least friction, verification optional/deferred.

## Verification
- `npm run lint` + `npx tsc --noEmit` + `npm run build` green.
- Manual: register → email has code+link; enter wrong code → error; correct code → verified;
  link still verifies; resend re-issues; expired code rejected.
```
