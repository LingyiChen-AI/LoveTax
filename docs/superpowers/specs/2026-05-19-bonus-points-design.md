# Bonus Points (加分功能) · Design Spec

**Date:** 2026-05-19
**Status:** Approved (brainstorming phase)
**Builds on:** [2026-05-18 couples-app design](2026-05-18-couples-app-design.md)
**Next:** writing-plans

## 1. Summary

Adds a "praise" / bonus-points action that mirrors the existing deduction flow. Partner A presses **✨ 夸 Ta** on the home page, picks 1-20 points (default 10), writes a reason, submits — Partner B's "today remaining" rises by that amount (capped at 100). B receives an email. A can void the praise same-day; B then receives a void email and the score drops back.

The intent is reconciliation: bonus offsets deductions ("Ta apologized" / "Ta did something I appreciated"). HP never exceeds 100 — bonus has no use once B is back at full HP.

Out of scope (v1):
- Bonus accumulating above 100
- Self-praise / partner-praises-me direction
- Separate "love points" counter independent of HP
- Different points-per-bonus rules vs deduction

## 2. Decisions (from brainstorming)

| # | Decision | Choice |
|---|---|---|
| 1 | Direction | I → Ta (mirror of deduction) |
| 2 | Effect on remaining | Offsets deductions; capped at 100; never accumulates above |
| 3 | Points per bonus | 1-20, default 10 (mirror deduction) |
| 4 | Reason | Required, 1-500 chars (mirror deduction) |
| 5 | Void | Same-day, deducter (= praiser) only, soft delete via `voided_at` (mirror deduction) |
| 6 | Email | Real-time, one email per bonus and per void (mirror deduction) |
| 7 | Reports | Bonus rows appear in today feed; trend uses updated `remaining` formula; reasons gets a "我的不满 / 我的感动" toggle; monthly adds a "praise count" stat |
| 8 | Home entry | Dual side-by-side buttons: `⚔️ 出招` (pink, deduct) and `✨ 夸 Ta` (sky-blue, bonus) |
| 9 | Storage | Single `deductions` table with a new `kind` column (`'deduct' \| 'bonus'`), points always positive 1-20 |
| 10 | Rate limit | `bonus:<user_id>` 10 per minute, separate counter from `deduct` |

## 3. System Overview

### 3.1 Core loop

```
Home → ⚔️出招 / ✨夸 Ta (双按钮)
   ↓
✨夸 Ta → bottom sheet (sky-blue theme, same layout)
   → chips 5/10/15/20 (default 10)
   → required reason textarea
   → submit
   ↓
createBonusAction → DB write (kind='bonus') → email → home animates
   ↘ partner receives "[LoveTax] Ta 夸了你 +N 分 — <reason>"
```

### 3.2 Module impact

| Module | Change |
|---|---|
| `lib/db/schema.ts` | `deductions` gets `kind` column; `emailTypeEnum` gets `'bonus'` and `'bonus_void'` |
| `lib/server-actions/create-bonus.ts` (NEW) | Server action mirroring `createDeductionAction`, caps by `deficit = 100 - remaining` |
| `lib/server-actions/void-deduction.ts` | Reads `row.kind` and dispatches to bonus-void email template when applicable |
| `lib/email/templates/bonus.tsx` (NEW) | Sky-blue praise email |
| `lib/email/templates/bonus-void.tsx` (NEW) | Sky-blue praise-void email |
| `lib/email/render.ts` | Exports `renderBonus()`, `renderBonusVoid()` |
| `lib/reports/today.ts` | Updates remaining formula; `FeedItem.kind` added |
| `lib/reports/trend.ts` | Updates `remaining` formula (adds bonus) |
| `lib/reports/reasons.ts` | Accepts `kind` filter; defaults to deduct, page adds a toggle |
| `lib/reports/monthly.ts` | Adds `bonusCount` / `bonusTotal` stats |
| `lib/validation/schemas.ts` | Reuses `createDeductionSchema` for `createBonus`; no new schema |
| `lib/errors.ts` | Adds `'BONUS_FULL'` to `AppErrorCode` |
| `lib/rate-limit.ts` | Adds `LIMITS.bonus = { windowMs: 60_000, limit: 10 }` |
| `lib/server-actions/admin/resend-email.ts` | Adds `'bonus' \| 'bonus_void'` branches |
| `components/praise-sheet.tsx` (NEW) | Sky-blue sister of `DeductSheet`, calls `createBonusAction` |
| `components/feed-item.tsx` | Renders `+N` (sky) vs `-N` (pink) based on `kind` |
| `app/(app)/home/page.tsx` | Two `flex-1` columns: `<DeductSheet>` left, `<PraiseSheet>` right |
| `app/(app)/reports/reasons/page.tsx` | Adds a kind toggle (deduct / bonus) |
| `app/(app)/reports/monthly/page.tsx` | Renders praise stats |

## 4. Data Model

### 4.1 Schema changes

```ts
// New enum
export const eventKindEnum = pgEnum('event_kind', ['deduct', 'bonus']);

// Existing emailTypeEnum — extend
export const emailTypeEnum = pgEnum('email_type', [
  'deduction', 'void', 'invite', 'password_reset',
  'bonus', 'bonus_void'
]);

// deductions: add one column
deductions {
  // ...all existing columns unchanged...
  kind: eventKindEnum('kind').notNull().default('deduct')
  // points still NOT NULL CHECK (BETWEEN 1 AND 20)
  // voided_at, voided_reason work as before
}

// New composite index for fast kind-aware aggregation
INDEX deductions_couple_date_kind_idx (couple_id, occurred_local_date, kind)
```

### 4.2 Derived values (updated)

**Today's remaining for user U:**
```ts
const today = todayInTz(U.timezone);
const [d] = sum(deductions.points) where to=U, date=today, kind='deduct', voided_at IS NULL;
const [b] = sum(deductions.points) where to=U, date=today, kind='bonus',  voided_at IS NULL;
remaining = Math.max(0, Math.min(DAILY_MAX, DAILY_MAX - Number(d) + Number(b)));
```

Floored at 0 and capped at 100, both enforced server-side. Never exposes a negative or over-100 value.

### 4.3 Edge cases

- **Bonus exceeds deficit:** `deficit = 100 - currentRemaining`. If `submitted > deficit`, record `pointsToApply = deficit`. If `deficit === 0`, return `BONUS_FULL`. (Mirror of deduction's `capPoints` / `BLOOD_EMPTY`.)
- **Voiding a bonus drops remaining:** the floor at 0 prevents going negative. UI/email show `0` in that case.
- **Concurrent operations:** read-then-write window. Same accepted-tradeoff as deductions per v1 spec.
- **Timezone change:** as with deductions, only affects future rows.

### 4.4 Migration

Auto-generated by drizzle-kit, expected to be:

```sql
CREATE TYPE "public"."event_kind" AS ENUM ('deduct', 'bonus');
ALTER TYPE "public"."email_type" ADD VALUE 'bonus';
ALTER TYPE "public"."email_type" ADD VALUE 'bonus_void';
ALTER TABLE "deductions" ADD COLUMN "kind" "event_kind" DEFAULT 'deduct' NOT NULL;
CREATE INDEX "deductions_couple_date_kind_idx" ON "deductions" ("couple_id", "occurred_local_date", "kind");
```

Zero data backfill — `DEFAULT 'deduct' NOT NULL` covers all existing rows.

## 5. User Flows

### 5.1 createBonus

1. Home → tap **✨ 夸 Ta**
2. Bottom sheet (sky-blue theme): chips 5/10/15/20 (default 10), required reason textarea
3. Tap **✨ 确认 +N 分**
4. Server Action `createBonusAction({ points, reason })`:
   1. `requirePaired()`
   2. Rate-limit `bonus:${me.id}`
   3. zod parse using `createDeductionSchema` (same shape)
   4. Look up partner; compute `today = todayInTz(partner.timezone)`
   5. Compute `currentRemaining` (using §4.2 formula)
   6. `deficit = DAILY_MAX - currentRemaining`. If `deficit === 0` → `BONUS_FULL`.
   7. `pointsToApply = min(submitted, deficit)`
   8. INSERT row with `kind: 'bonus'`, `points: pointsToApply`, normal `from/to/couple/date`
   9. `newRemaining = currentRemaining + pointsToApply`
   10. `sendWithRetry({ type: 'bonus', ... })` fire-and-forget
   11. `revalidatePath('/home')`
   12. Return `{ ok: true, pointsApplied, remaining: newRemaining }`
5. Sheet closes; Ta's HP bar animates up; feed gains a sky `+N` row

### 5.2 void (works for both kinds)

`voidDeductionAction` already operates on any row by id. Extension:

1. Load row → existing checks (`from_user`, today, not voided)
2. UPDATE `voided_at`
3. Compute new remaining (formula unchanged — already accounts for kind via `voided_at IS NULL` filter)
4. Branch on `row.kind`:
   - `'deduct'` → `renderVoid(...)`, `sendWithRetry({ type: 'void' })`
   - `'bonus'` → `renderBonusVoid(...)`, `sendWithRetry({ type: 'bonus_void' })`
5. Revalidate

The UI's existing `VoidButton` works unchanged — server picks the right email.

### 5.3 Reports

- **Today**: `view.feed` carries `kind`; `FeedItem` colors `+N` sky vs `-N` pink. Sums fed through updated remaining formula.
- **Trend (7/30d)**: SQL groups by `(date, kind, to_user_id)` → maps each `(date, to_user)` into `remaining = 100 - deductSum + bonusSum`, clamped.
- **Top reasons**: query accepts both `toUserId` and `kind` params. Page shows a single horizontal chip row of 4 buttons: `我被扣 / Ta 被扣 / 我被夸 / Ta 被夸` (target × kind). Default selected = `我被扣` (current behavior).
- **Monthly**: same metrics as before, plus `praiseCount`, `praisePointsTotal` for the user. Shown as two extra stat cards.

### 5.4 Email templates

| Template | Subject | Visual |
|---|---|---|
| `bonus` | `[LoveTax] Ta 夸了你 +N 分 — <reason>` | sky-blue header, blue HP highlight, opens to `/home` |
| `bonus_void` | `[LoveTax] Ta 撤销了一次夸奖` | sky-blue toned, shows new remaining (may be 0 if extensive deductions since) |

Both: same structure as `deduction` / `void` templates with color swap pink → sky.

### 5.5 Admin

- **`adminResendEmail`** gains `bonus` / `bonus_void` branches that re-render from the matching `deductions` row + corresponding template.
- **Couple detail page** (`/admin/couples/[id]`) shows mixed feed — display column adds an icon or color to distinguish kind (icon: ✨ for bonus, ⚔️ for deduct, or just colored `+N` / `-N`).

## 6. Error Handling / Security

### 6.1 New error code

| Code | Trigger |
|---|---|
| `BONUS_FULL` | Partner's remaining is already 100; no headroom |

Existing `FORBIDDEN_VOID` covers void-bonus failures (same logic, same error).

### 6.2 AuthZ matrix (updated)

| Action | Allowed for |
|---|---|
| createDeduction | paired user |
| **createBonus** | **paired user** (new) |
| voidDeduction | from_user, same day (works for both kinds) |
| view own couple's data | both couple members (voided shown greyed) |
| view any couple | admin |
| createUser, resetPassword | admin |
| changeOwnPassword | self |

### 6.3 Rate limits (updated)

```ts
LIMITS = {
  register: { windowMs: 3600_000, limit: 3 },
  login:    { windowMs:  300_000, limit: 10 },
  deduct:   { windowMs:   60_000, limit: 10 },
  bonus:    { windowMs:   60_000, limit: 10 },   // NEW
  invite:   { windowMs: 3600_000, limit: 5 }
}
```

Bonus has its own bucket — operationally identical to deduct.

### 6.4 Input validation

`createDeductionSchema` is reused for `createBonusAction` (same shape, no new schema needed). zod check at action entry.

### 6.5 Email failures

`sendWithRetry` is unchanged. Failed sends go to `email_log` and can be resent from `/admin/email-failures`. Bonus / bonus_void types resolved by the existing resend logic with two new branches.

## 7. UI / Visual Spec

### 7.1 Tokens (already exist from Y2K rebrand)

```
sky-grad   linear-gradient(135deg, #6FB8FF, #7DC8FF)  — bonus accent
pink-grad  linear-gradient(135deg, #FF6FB5, #C77DFF)  — deduct accent (current)
shadow-neo-blue  3px 3px 0 #B4DCFF
shadow-neo       3px 3px 0 #FFB6E6 (pink, default)
text-sky-grad / text-pink-grad utilities
```

No new tokens needed.

### 7.2 Home button row

```
+----------------+   +----------------+
|  ⚔️ 出招       |   |  ✨ 夸 Ta      |
| pink gradient  |   | sky gradient   |
+----------------+   +----------------+
```

Both pill-style, `flex-1` each, gap 8px. Disabled states:
- 出招: when partner remaining = 0 → "Ta 今天已被打空"
- 夸 Ta: when partner remaining = 100 → "Ta 满血了"

### 7.3 PraiseSheet

Identical layout/behavior to `DeductSheet`:
- Title: `✨ 夸 Ta`
- 4 chips 5/10/15/20 (default 10)
- Reason textarea (`说说 Ta 哪里让你开心了…`)
- Confirm button: `✨ 确认 +N 分` — sky gradient instead of red
- Cancel link below

The "max" hint reads: `min(20, 还能加 ${100 - partnerRemaining})`.

### 7.4 Feed item color

- `-N` → `text-danger` (kawaii pink, existing)
- `+N` → `text-healthy` (sky blue, existing)
- Symbol auto-determined by kind

### 7.5 Mixed feed example

```
18:44   -20   陈毫 → 陈 · 没回消息
19:10   +10   陈毫 → 陈 · 给我带了奶茶
19:30   -5    陈毫 → 陈 · 吃饭吧唧嘴
```

Time + N column colored by kind. Reason text inherits ink color.

## 8. Testing

### 8.1 Unit (Vitest)

`tests/unit/score.test.ts` — extend with a `describe('remaining with bonus')` group:
- bonus offsets deductions (deduct 30 + bonus 10 → 80)
- caps at 100 (over-submit cuts to deficit)
- floors at 0 after voiding bonus that took remaining below

`capPoints` is already general enough (deficit replaces remaining) — no new helper.

### 8.2 Integration (Vitest + real Postgres)

**New file** `tests/integration/create-bonus.test.ts` — 6 cases:
- inserts row + sends bonus email
- BONUS_FULL when partner at 100
- mid-cap (submit 20 with deficit 12 → records 12)
- INVALID_POINTS (0, 21)
- INVALID_REASON (empty)
- remaining correct after deduct→bonus chain

**Extend** `tests/integration/void-deduction.test.ts`:
- void a bonus row → sends `bonus_void` email → remaining drops
- voided bonus that would push remaining negative stays floored at 0

**Extend** `tests/integration/reports-today.test.ts`:
- mixed feed (deduct + bonus) returned in `occurred_at desc`
- remaining uses both kinds correctly

### 8.3 E2E (Playwright)

Extend `tests/e2e/golden-path.spec.ts` with steps after the existing deduction:
- A taps `✨ 夸 Ta`, picks 5, writes "对不起", submits
- B receives `[LoveTax] Ta 夸了你 +5 分` in Mailpit
- A's home shows new feed row `+5 对不起` (sky)
- A's view of Ta's HP rises (e.g. 90 → 95)
- A voids the bonus → B receives `[LoveTax] Ta 撤销了一次夸奖`
- A's view of Ta's HP returns to 90

### 8.4 CI

No workflow changes. Same `npm test && test:integration && test:e2e` covers everything.

## 9. Implementation Order (preview)

Full plan generated in `writing-plans` phase. Sequence:

1. Drizzle schema: add `kind` to `deductions`, extend `emailTypeEnum` → generate migration → apply
2. Update `lib/reports/today.ts` to compute `remaining` with bonus, carry `kind` in `FeedItem`
3. Update `lib/reports/trend.ts`, `monthly.ts`, `reasons.ts` for kind-aware aggregations
4. Implement `lib/server-actions/create-bonus.ts` + integration tests
5. Extend `lib/server-actions/void-deduction.ts` to dispatch email by kind + integration tests
6. New email templates: `bonus.tsx`, `bonus-void.tsx` + render exports + snapshot tests
7. New `components/praise-sheet.tsx` (clone DeductSheet, swap colors/action)
8. Update `components/feed-item.tsx` to color by kind
9. Update `app/(app)/home/page.tsx` to render both sheets side-by-side
10. Update `app/(app)/reports/reasons/page.tsx` with kind toggle
11. Update `app/(app)/reports/monthly/page.tsx` with bonus stats
12. Update `lib/server-actions/admin/resend-email.ts` with bonus / bonus_void branches
13. Update `lib/rate-limit.ts` LIMITS + apply in `createBonusAction`
14. Update `lib/errors.ts` with `BONUS_FULL`
15. Extend E2E golden path

## 10. Out of Scope / Future

- Self-praise ("today I had a good day, +10 myself")
- Partner-can-praise-me direction (different mental model)
- Bonus accumulating above 100 (gamification: "perfect+20 day" badges)
- Separate "love points" counter independent of HP
- Different point ranges or quotas for bonus vs deduct
- Categorization (auto-tagging praise reasons like "礼物 / 体贴 / 表扬"); ties into the existing reasons-tagging deferral from the parent spec
