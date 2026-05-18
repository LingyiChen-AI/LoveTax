import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('INVALID_EMAIL');

export const passwordSchema = z
  .string()
  .min(8, 'WEAK_PASSWORD')
  .regex(/[A-Za-z]/, 'WEAK_PASSWORD')
  .regex(/\d/, 'WEAK_PASSWORD');

export const displayNameSchema = z.string().trim().min(1).max(20);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  inviteToken: z.string().optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1)
});

export const createDeductionSchema = z.object({
  points: z.coerce.number().int().min(1, 'INVALID_POINTS').max(20, 'INVALID_POINTS'),
  reason: z.string().trim().min(1, 'INVALID_REASON').max(500, 'INVALID_REASON')
});

export const voidDeductionSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().max(200).optional()
});

export const inviteSchema = z.object({
  inviteeEmail: emailSchema
});

export const acceptInviteSchema = z.object({
  token: z.string().min(8)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(), // optional when must_change_password
  newPassword: passwordSchema
});

export const updateSettingsSchema = z.object({
  displayName: displayNameSchema.optional(),
  timezone: z.string().min(1).optional()
});

export const adminCreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  role: z.enum(['user', 'admin']).default('user')
});
