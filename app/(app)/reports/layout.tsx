import type { ReactNode } from 'react';
import { requirePaired } from '@/lib/auth/require-session';
import { ReportsNav } from './nav';

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  await requirePaired();
  return (
    <div className="space-y-4">
      <ReportsNav />
      {children}
    </div>
  );
}
