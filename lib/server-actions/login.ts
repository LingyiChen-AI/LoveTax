'use server';

import { signIn } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';
import { checkAndIncrement, LIMITS } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = getClientIp();
  const rl = await checkAndIncrement({ key: `login:${ip}`, ...LIMITS.login });
  if (!rl.allowed) return { error: 'RATE_LIMITED' };

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });
  if (!parsed.success) return { error: 'INVALID_INPUT' };

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false
    });
  } catch (e) {
    return { error: 'INVALID_CREDENTIALS' };
  }
  // Let the root route handler decide where to send the user
  // (admin → /admin/users, paired → /home, unpaired → /onboarding).
  redirect('/');
}
