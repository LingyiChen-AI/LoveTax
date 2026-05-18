import { requireUser } from '@/lib/auth/require-session';
import { TabBar } from '@/components/tab-bar';
import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <main className="min-h-dvh max-w-md mx-auto p-4 pb-24">{children}</main>
      {user.coupleId && <TabBar />}
    </>
  );
}
