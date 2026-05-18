import { requireUser } from '@/lib/auth/require-session';
import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return (
    <main className="min-h-dvh max-w-md mx-auto p-4">{children}</main>
  );
}
