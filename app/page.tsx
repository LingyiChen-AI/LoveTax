import { redirect } from 'next/navigation';
import { getOptionalUser } from '@/lib/auth/require-session';

export default async function Index() {
  const user = await getOptionalUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/change-password');
  if (!user.coupleId) redirect('/onboarding');
  redirect('/home');
}
