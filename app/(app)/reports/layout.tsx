import Link from 'next/link';
import type { ReactNode } from 'react';
import { requirePaired } from '@/lib/auth/require-session';

const TABS = [
  { href: '/reports/trend', label: '趋势' },
  { href: '/reports/reasons', label: '原因' },
  { href: '/reports/monthly', label: '月报' }
];

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  await requirePaired();
  return (
    <div className="space-y-4">
      <div className="flex bg-paper border-2 border-white rounded-card p-1 gap-1">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="flex-1 py-2 text-center text-sm font-extrabold rounded-chip hover:bg-bg">
            {t.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
