'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/home', label: '主页', icon: Home },
  { href: '/reports/trend', label: '报表', icon: BarChart3, match: '/reports' },
  { href: '/settings', label: '设置', icon: Settings }
] as const;

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-3 inset-x-0 mx-auto max-w-md px-4 z-30">
      <ul className="flex bg-paper border-[2.5px] border-ink rounded-card shadow-neo overflow-hidden">
        {ITEMS.map((it) => {
          const active = (it as any).match ? path.startsWith((it as any).match) : path === it.href;
          const Icon = it.icon;
          return (
            <li key={it.href} className="flex-1">
              <Link href={it.href} className={cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-extrabold', active && 'bg-accent')}>
                <Icon size={18} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
