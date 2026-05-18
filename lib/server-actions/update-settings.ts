'use server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { updateSettingsSchema } from '@/lib/validation/schemas';
import { requireUser } from '@/lib/auth/require-session';
import { SUPPORTED_TIMEZONES } from '@/lib/timezones';
import { revalidatePath } from 'next/cache';

export async function updateSettingsAction(formData: FormData): Promise<{ ok: true } | { error: string }> {
  const me = await requireUser();
  const tz = formData.get('timezone');
  if (tz && !SUPPORTED_TIMEZONES.includes(String(tz) as (typeof SUPPORTED_TIMEZONES)[number])) {
    return { error: 'INVALID_INPUT' };
  }
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
