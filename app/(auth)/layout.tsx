import { getOptionalUser } from '@/lib/auth/require-session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getOptionalUser();
  if (user && !user.mustChangePassword) redirect('/');
  return (
    <main className="min-h-dvh flex items-center justify-center p-5">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
