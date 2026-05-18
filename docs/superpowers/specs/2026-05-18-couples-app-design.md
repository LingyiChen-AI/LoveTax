# zchat — Couples Daily Deduction App · Design Spec

**Date:** 2026-05-18
**Status:** Approved (brainstorming phase)
**Next:** writing-plans

## 1. Product Summary

A self-hosted web app for couples. Each partner starts the day with 100 points. When one partner is unhappy with the other, they "deduct" points from the offender (1–20 per deduction, 10 default) with a required free-text reason. Each deduction triggers an immediate email to the deducted partner. Points reset daily at midnight in the deducted partner's timezone. Mobile-first UI in a gamified visual style (HP bars, bold black borders, yellow accent).

Out of scope (v1): mobile native app, OAuth login, password self-reset, reason tags / auto-categorization, multi-language, push notifications.

## 2. Decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| 1 | Scoring model | Each person has their own daily 100-point account; partner deducts from it |
| 2 | Reset cadence | Daily reset to 100 (no carry-over) |
| 3 | Reset timezone | Per-user; default `Asia/Shanghai`; reset boundary uses the deducted partner's timezone |
| 4 | Points per deduction | 1–20, default 10 |
| 5 | Below-zero behavior | Server caps to remaining (e.g. submit -10 when 5 left → records -5); reject if remaining=0 |
| 6 | Undo | Same-day only; only the deducter; soft delete (`voided_at`); sends a void email |
| 7 | Reason input | Free text, 1–500 chars, required |
| 8 | User & pairing | Self-registration + email invite. Admin role still exists (super-user). |
| 9 | Login | Email + password (bcrypt, cost 12) |
| 10 | Reports | Today dashboard / 7-30 day trend / top reasons / monthly summary |
| 11 | Email notification | Real-time, one email per deduction (and per void) |
| 12 | Deployment | Self-hosted Docker (Postgres + Next.js); SMTP via env config |
| 13 | Visual style | Gamified / playful — HP bar metaphor, bold black borders, yellow (#FBBF24) accent, red (#DC2626) for "danger" / deductions |
| 14 | Home layout (mobile) | VS showdown — my HP left, partner HP right, big "出招" button below |
| 15 | Deduction UI | Bottom sheet (slides up, ~65% screen, dismissable by drag-down) |
| 16 | Tech stack | Next.js 14 App Router + Server Actions + Drizzle ORM + Auth.js (Credentials) + Recharts + Nodemailer + Postgres 16 |

## 3. System Overview

### 3.1 Core loop

```
Login → VS home (my HP vs partner HP)
      → "出招" → bottom sheet (points 1–20, reason text)
      → submit → DB write → email → home animates
                                  ↘ partner receives email → opens app
```

### 3.2 Modules

| Module | Responsibility |
|---|---|
| `app/(auth)/*` | register, login, accept-invite |
| `app/(app)/*` | authenticated app (home, reports, settings) |
| `app/admin/*` | admin panel (users, couples, manual create, password reset, email failure log) |
| `lib/db/*` | Drizzle schema, client, migrations |
| `lib/auth/*` | Auth.js config, server `auth()` util |
| `lib/email/*` | Nodemailer transport, HTML templates (deduction / void / invite / password-reset) |
| `lib/server-actions/*` | `createDeduction`, `voidDeduction`, `inviteUser`, `acceptInvite`, etc. |
| `lib/reports/*` | aggregation queries (today, trend, top reasons, monthly) |
| `lib/score.ts` | pure scoring helpers (cap, remaining) |
| `lib/date.ts` | pure timezone-aware date helpers |
| `lib/rate-limit.ts` | DB-backed sliding-window limiter |

### 3.3 Deployment

`docker-compose.yml` with three services:

- `web` — Next.js standalone build, port 3000
- `db` — `postgres:16-alpine`, volume `pgdata`, healthcheck
- (mail) — no container; `SMTP_*` env vars point to external SMTP (Gmail / QQ / Mailgun)

Reverse proxy is the operator's responsibility; a sample `Caddyfile` is included in `docs/deployment.md`.

Backup: a separate cron one-liner runs `pg_dump` and uploads to user-configured location (out of scope for v1; doc only).

## 4. Data Model (Drizzle + Postgres)

### 4.1 Tables

```ts
// users
users {
  id: uuid PK DEFAULT gen_random_uuid()
  email: text UNIQUE NOT NULL
  password_hash: text NOT NULL
  display_name: text NOT NULL          // 1-20 chars
  role: enum('user','admin') DEFAULT 'user'
  couple_id: uuid FK -> couples.id NULL ON DELETE SET NULL
  timezone: text DEFAULT 'Asia/Shanghai'
  must_change_password: boolean DEFAULT false  // set when admin resets
  created_at, updated_at: timestamptz
}

// couples
couples {
  id: uuid PK
  created_at: timestamptz
}

// invitations
invitations {
  id: uuid PK
  inviter_user_id: uuid FK -> users.id
  invitee_email: text NOT NULL
  token: text UNIQUE NOT NULL         // 32-byte random, base64url
  status: enum('pending','accepted','expired') DEFAULT 'pending'
  expires_at: timestamptz             // inviter creation + 7 days
  accepted_at: timestamptz NULL
  created_at: timestamptz
}

// deductions
deductions {
  id: uuid PK
  couple_id: uuid FK -> couples.id NOT NULL   // denormalized for query speed
  from_user_id: uuid FK -> users.id NOT NULL  // the deducter
  to_user_id: uuid FK -> users.id NOT NULL    // the deductee
  points: smallint NOT NULL CHECK (points BETWEEN 1 AND 20)
  reason: text NOT NULL CHECK (length(reason) BETWEEN 1 AND 500)
  occurred_at: timestamptz NOT NULL DEFAULT now()
  occurred_local_date: date NOT NULL          // computed in deductee's tz
  voided_at: timestamptz NULL
  voided_reason: text NULL                    // 0-200 chars
  created_at: timestamptz

  INDEX deductions_couple_date_idx (couple_id, occurred_local_date)
  INDEX deductions_to_date_idx (to_user_id, occurred_local_date)
}

// email_log
email_log {
  id: uuid PK
  deduction_id: uuid FK -> deductions.id NULL
  type: enum('deduction','void','invite','password_reset')
  to_email: text NOT NULL
  subject: text NOT NULL
  status: enum('sent','failed')
  error: text NULL
  attempts: smallint DEFAULT 0
  sent_at: timestamptz                       // last attempt time
}

// rate_limits
rate_limits {
  key: text NOT NULL                         // e.g. "register:1.2.3.4", "deduct:<uuid>"
  count: int NOT NULL
  window_start: timestamptz NOT NULL
  PRIMARY KEY (key)
}
```

### 4.2 Derived values

- **Today's remaining for user U** = `100 - SUM(points)` from `deductions` where `to_user_id = U`, `occurred_local_date = today(U.timezone)`, `voided_at IS NULL`. Computed live in queries; no cached column. Floored at 0 by the cap on insert; never negative.
- **Couple's home view** = the two users' remaining + today's `deductions` rows for both, fetched in a single SQL query (GROUP BY `to_user_id` for the sums, plus a separate ordered list for the feed).

### 4.3 Edge cases (data layer)

- **Negative remaining:** never. Server caps `points` to `min(submitted, current_remaining)` before insert. If `current_remaining == 0`, action errors with `BLOOD_EMPTY`.
- **Concurrent submits:** two transactions reading-then-writing are safe because the server caps using the value read just before insert; over-deduction is impossible (final cap clamps before write). Worst case: one of them gets a smaller-than-requested cap. Acceptable.
- **Timezone change:** `users.timezone` change does NOT recompute historical `occurred_local_date`. Documented in settings UI.

## 5. User Flows

### 5.1 Register + pair (cold start)

1. A opens site → `/register` → fills `email / password / display_name` → submit
2. `users` row inserted with `couple_id = NULL`; auto-login; redirect to `/onboarding`
3. A enters B's email → submit → `invitations` row + invite email sent to B
4. A's home shows "Waiting for Ta to accept" placeholder
5. B clicks email link `https://x/invite/<token>`:
   - if email unregistered → `/register?invite=<token>` (token preserved across registration; auto-accepts on success)
   - if email registered → login first → `/invite/<token>` confirm page → accept
6. On accept:
   - if no `couples` row yet: create one
   - `users.couple_id = couples.id` for both A and B
   - `invitations.status = 'accepted'`
7. Both redirected to `/` home

### 5.2 Create deduction (the core action)

1. Home → tap **出招** → bottom sheet animates up
2. Default chip `10` selected; chips: 5 / 10 / 15 / 20 (a "custom" entry can type 1–20)
3. Required textarea: reason
4. Tap **确认 -N 分** → Server Action `createDeduction({ points, reason })`:
   1. `auth()` → must have `couple_id`
   2. Compute `to_user_id` from couple, `occurred_local_date` from `to_user.timezone`
   3. `remaining = 100 - SUM(...)`; if `remaining == 0` → error `BLOOD_EMPTY`
   4. `actualPoints = min(points, remaining)`
   5. INSERT row (committed before email is attempted)
   6. Call `sendWithRetry`, which awaits up to 3 attempts internally and catches all errors; failures write `email_log.status=failed` and never throw to the action caller. The deduction is preserved either way.
   7. `revalidatePath('/')`
5. Sheet closes; home HP bar animates down

### 5.3 Void

1. Home "今日战报" lists today's deductions
2. Items where `from_user_id == me && voided_at IS NULL` show a "撤销" button
3. Tap → confirm dialog "撤销后会再发一封邮件通知 Ta,确定?"
4. Server Action `voidDeduction({ id, reason? })`:
   1. Load row → assert `from_user_id == me`, `voided_at IS NULL`, `occurred_local_date == today(to_user.tz)` (same day in the deductee's timezone — the same boundary that controls remaining)
   2. UPDATE `voided_at = now(), voided_reason = ?`
   3. `sendWithRetry` for the void email (same non-throwing semantics as deduction email)
5. Row shows greyed + strikethrough in the feed

### 5.4 Reports (`/reports`)

Four tabs (bottom tab bar in the app):
- **今日** — same as home (alias)
- **趋势** — Recharts line chart, two lines (me / partner), x = last 7 days or 30 days (toggle), y = remaining at end of each `occurred_local_date`
- **高频原因** — Top-20 ranking grouped by exact reason string (case-folded, trimmed). Acknowledged limitation: low-quality grouping for Chinese; documented as v1 limit, v2 may add jieba.
- **月报** — month picker → conflict count / avg remaining / worst day / best day / "harmony rate" (% of days both ended at 100)

### 5.5 Email templates

All in `lib/email/templates/*.tsx` rendered via `@react-email/render`.

- **Deduction:** subject `[zchat] Ta 给你扣了 N 分 — <reason>`; body: VS header image, deducter's display_name, points, reason, deductee's new remaining, login link
- **Void:** subject `[zchat] Ta 撤销了一次扣分`; body: which row, new remaining
- **Invite:** subject `[zchat] X 邀请你加入 zchat`; body: accept link, 7-day expiry note
- **Password reset:** subject `[zchat] 你的临时密码`; body: temp password, "登录后请立即修改"

### 5.6 Admin (`/admin`)

`role=admin` only. Tabs:
- Users — list / search / sort / create / reset-password
- Couples — list / view a couple's deduction history (read-only)
- Email failures — `email_log where status='failed'`, manual "resend" button

First admin: `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` env vars. A startup script (`scripts/seed-admin.ts`) runs after migrations on container start; if no row with `role=admin` exists and both env vars are set, it inserts one. Idempotent on subsequent boots.

## 6. Error Handling / Security

### 6.1 Input validation

zod schemas at Server Action boundary. See decision matrix in §4 of brainstorming; codified errors:

| Code | Trigger |
|---|---|
| `INVALID_POINTS` | not int 1–20 |
| `INVALID_REASON` | empty / >500 chars |
| `INVALID_EMAIL` | not RFC |
| `WEAK_PASSWORD` | <8 chars or missing letter/digit |
| `BLOOD_EMPTY` | remaining = 0 |
| `NOT_PAIRED` | acting user has no `couple_id` |
| `FORBIDDEN_VOID` | not from_user / not today |
| `INVITE_INVALID` | bad token / expired / accepted |
| `RATE_LIMITED` | window exceeded |

### 6.2 AuthZ matrix

| Action | Allowed for |
|---|---|
| createDeduction | paired user |
| voidDeduction | from_user, same day |
| view own couple's data | both couple members (voided rows visible, rendered greyed/strikethrough) |
| view any couple | admin |
| createUser, resetPassword | admin |
| changeOwnPassword | self |

### 6.3 Email failures

`sendWithRetry`: exponential backoff 1s / 5s / 30s, max 3 attempts; on final failure write `email_log.status=failed`; never throw to Server Action caller. Admin can resend from log UI.

### 6.4 Rate limits

| Key | Window | Limit |
|---|---|---|
| `register:<ip>` | 1 hour | 3 |
| `login:<ip>` | 5 min | 10 |
| `deduct:<user_id>` | 1 min | 10 |
| `invite:<user_id>` | 1 hour | 5 |

Implementation: `rate_limits` table with `(key, count, window_start)`; atomic upsert in a transaction.

IP source: read from `x-forwarded-for` if `TRUST_PROXY=true`, else from the socket. Documented in deployment guide that reverse-proxy operators must set `TRUST_PROXY=true` and ensure the proxy strips/sets `x-forwarded-for` correctly.

### 6.5 Passwords

- bcrypt cost 12
- `must_change_password = true` after admin reset → on next login, redirect to `/change-password` until updated
- No self-serve "forgot password" in v1

### 6.6 Sessions

Auth.js JWT strategy, `maxAge: 30d`. Cookie flags: `httpOnly`, `secure` (production), `sameSite=lax`.

### 6.7 Invite tokens

32 bytes from `crypto.randomBytes`, base64url encoded. Stored as-is in `invitations.token`. Single-use; `status` transitions enforce idempotency.

## 7. UI / Visual Spec

### 7.1 Style tokens

```
/* Colors */
--ink:      #1F2937    /* primary outline + text */
--bg:       #FEF3C7    /* page background (warm yellow) */
--accent:   #FBBF24    /* primary buttons, active chips */
--danger:   #DC2626    /* HP-low, deduction big numbers */
--healthy:  #10B981    /* partner doing fine */
--paper:    #FFFFFF    /* card surface */
--muted:    #6B7280    /* secondary text */

/* Borders */
border: 2.5px solid var(--ink);
border-radius: 14px;             /* cards */
border-radius: 10px;             /* inputs / chips */
border-radius: 24px 24px 0 0;    /* bottom sheet top */
box-shadow: 3px 3px 0 var(--ink); /* hard "neo-brutalist" shadow */

/* Typography */
font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
weights: 600 / 700 / 800 (no light/regular)
```

### 7.2 Key screens

- **Login / Register** — single centered card, same border + shadow language
- **Home (VS layout)** — see brainstorm mockup `home-layout.html` choice B. Two HP cards side-by-side with "VS" between; big yellow "出招" button below; "战报" list under
- **Deduct sheet** — see `deduct-modal.html` choice A. Slides up from bottom, dimmed background, 4 chips + textarea + red confirm button
- **Reports** — bottom tab bar (今日 / 趋势 / 原因 / 月报); shared layout under tab
- **Settings** — display_name, timezone, change password
- **Admin** — desktop-oriented table view (mobile fallback: card list)

Mobile-first: design at 375px width; scale up for tablet/desktop with max-width centered layout (`max-w-md mx-auto`).

### 7.3 Component library

Tailwind CSS + shadcn/ui for primitives (Button / Dialog / Sheet / Tabs / Form). The neo-brutalist look (thick borders, hard offset shadows, no soft glows) requires overriding shadcn's defaults globally via the tokens above plus a custom `globals.css` variant — defaults like soft shadows / pill radius are explicitly disabled. Recharts for graphs (custom theming to match: no gradients in v1, solid line colors + dashed grid).

The `ui-ux-pro-max` skill is referenced during implementation for component-level polish (color systems, accessibility, interaction states, shadows).

## 8. Testing Strategy

### 8.1 Unit (Vitest)

- `lib/score.ts` — cap edge cases
- `lib/date.ts` — timezone day-boundary cases
- `lib/reports.ts` — aggregation with voided rows / empty data / cross-day
- `lib/email/templates/*` — snapshot + HTML escape
- `lib/rate-limit.ts` — window correctness

### 8.2 Integration (Vitest + real Postgres in Docker)

`docker-compose.test.yml` brings up a disposable `db`. Each test truncates relevant tables.

Coverage: register / invite / accept / pair / createDeduction (success + cap + BLOOD_EMPTY) / void (success + cross-day reject + non-owner reject) / email send mocked-to-noop / email failure path writes `email_log`.

### 8.3 E2E (Playwright)

Golden path scripted; SMTP captured by **Mailpit** container.

1. Register A → invite B → B registers via link → pair confirmed
2. A submits -10 with reason → home blood bar animates to 90 on B's view
3. Mailpit shows email with subject containing `-10`
4. A voids → Mailpit shows void email
5. A views trend page → today's data point present

### 8.4 Not tested

Auth.js internals; Drizzle internals; Recharts rendering; pixel-perfect visual; browser matrix beyond modern Chrome/Safari (manual mobile QA).

### 8.5 CI

GitHub Actions on push:
- service containers: `postgres:16-alpine`, `axllent/mailpit`
- steps: install / typecheck / vitest run / playwright test
- on success on `main`: build & push docker image to `ghcr.io` (optional)

## 9. Open Questions & Future Work

Resolved during brainstorming; nothing blocking implementation.

Deferred to v2:
- Reason tagging / categorization for better Top-N reports (jieba or LLM)
- Self-serve password reset via email link
- Push notifications (web push / mobile native)
- Mobile native app (would require API extraction beyond Server Actions)
- Multi-language (i18n)
- "Bonus points" / positive feedback mode
- Couple anniversary timeline / milestone celebrations

## 10. Implementation Order (preview — full plan in writing-plans phase)

1. Repo scaffold + Docker compose + Postgres up
2. Drizzle schema + migrations + seed admin
3. Auth.js + register / login / change-password
4. Invite flow + pairing
5. Home page (VS layout, read-only first)
6. createDeduction Server Action + bottom sheet UI + cap logic
7. Email transport + deduction template
8. Void flow + void email
9. Reports: today / trend / top reasons / monthly
10. Admin panel
11. Rate limits
12. Email failure log + resend
13. Tests (unit/integration alongside features, E2E at the end)
14. Deployment docs + Caddyfile sample + pg_dump cron sample
