'use server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { updateSettingsSchema } from '@/lib/validation/schemas';
import { requireUser } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';

const SUPPORTED_TZS = ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'UTC'];

export async function updateSettingsAction(formData: FormData): Promise<{ ok: true } | { error: string }> {
  const me = await requireUser();
  const tz = formData.get('timezone');
  if (tz && !SUPPORTED_TZS.includes(String(tz))) return { error: 'INVALID_INPUT' };
  const parsed = updateSettingsSchema.safeParse({
    displayName: formData.get('displayName') || undefined,
    timezone: tz || undefined
  });
  if (!parsed.success) return { error: 'INVALID_INPUT' };

  await db.update(users).set({
    ...(parsed.data.displayName ? { displayName: parsed.data.displayName } : {}),
    ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
    updatedAt: new Date()
  }).where(eq(users.id, me.id));
  revalidatePath('/settings');
  revalidatePath('/home');
  return { ok: true };
}

export const SUPPORTED_TIMEZONES = SUPPORTED_TZS;
