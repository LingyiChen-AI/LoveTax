import {
  pgTable, pgEnum, uuid, text, smallint, integer, timestamp, date, boolean, index, check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired']);
export const emailTypeEnum = pgEnum('email_type', ['deduction', 'void', 'invite', 'password_reset']);
export const emailStatusEnum = pgEnum('email_status', ['sent', 'failed']);

export const couples = pgTable('couples', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: roleEnum('role').notNull().default('user'),
  coupleId: uuid('couple_id').references(() => couples.id, { onDelete: 'set null' }),
  timezone: text('timezone').notNull().default('Asia/Shanghai'),
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  inviterUserId: uuid('inviter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  inviteeEmail: text('invitee_email').notNull(),
  token: text('token').notNull().unique(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const deductions = pgTable(
  'deductions',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    coupleId: uuid('couple_id').notNull().references(() => couples.id, { onDelete: 'cascade' }),
    fromUserId: uuid('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    toUserId: uuid('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    points: smallint('points').notNull(),
    reason: text('reason').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    occurredLocalDate: date('occurred_local_date').notNull(),
    voidedAt: timestamp('voided_at', { withTimezone: true }),
    voidedReason: text('voided_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    coupleDate: index('deductions_couple_date_idx').on(t.coupleId, t.occurredLocalDate),
    toDate: index('deductions_to_date_idx').on(t.toUserId, t.occurredLocalDate),
    pointsRange: check('deductions_points_range', sql`${t.points} BETWEEN 1 AND 20`),
    reasonLen: check('deductions_reason_len', sql`length(${t.reason}) BETWEEN 1 AND 500`)
  })
);

export const emailLog = pgTable('email_log', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  deductionId: uuid('deduction_id').references(() => deductions.id, { onDelete: 'set null' }),
  type: emailTypeEnum('type').notNull(),
  toEmail: text('to_email').notNull(),
  subject: text('subject').notNull(),
  status: emailStatusEnum('status').notNull(),
  error: text('error'),
  attempts: smallint('attempts').notNull().default(0),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow()
});

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull()
});
