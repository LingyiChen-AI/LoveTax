'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/reports/trend', label: '趋势' },
  { href: '/reports/reasons', label: '原因' },
  { href: '/reports/monthly', label: '月报' }
];

export function ReportsNav() {
  const path = usePathname();
  return (
    <div className="flex bg-paper rounded-card p-1 gap-1">
      {TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + '/');
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'flex-1 py-2 text-center text-sm font-semibold rounded-chip transition',
              active ? 'bg-bg text-ink shadow-sm' : 'text-muted'
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
