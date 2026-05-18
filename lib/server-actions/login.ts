'use server';

import { signIn } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/schemas';
import { redirect } from 'next/navigation';

export type LoginState = { error?: string } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
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
  redirect('/home');
}
