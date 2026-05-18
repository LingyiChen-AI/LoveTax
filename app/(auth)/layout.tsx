import { getOptionalUser } from '@/lib/auth/require-session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getOptionalUser();
  if (user && !user.mustChangePassword) redirect('/');
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-5">
      <Logo size="lg" />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
