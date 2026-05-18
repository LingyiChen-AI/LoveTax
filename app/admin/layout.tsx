import { requireAdmin } from '@/lib/auth/require-session';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/lib/server-actions/logout';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await requireAdmin();
  return (
    <main className="min-h-dvh max-w-3xl mx-auto p-4">
      <nav className="flex gap-2 mb-4 flex-wrap items-center">
        <Link href="/admin/users" className="neo-chip px-3">用户</Link>
        <Link href="/admin/couples" className="neo-chip px-3">情侣</Link>
        <Link href="/admin/email-failures" className="neo-chip px-3">邮件失败</Link>
        <span className="flex-1" />
        <span className="text-xs text-muted font-bold">{me.email}</span>
        <form action={logoutAction}>
          <button type="submit" className="neo-chip px-3 bg-paper">退出</button>
        </form>
      </nav>
      {children}
    </main>
  );
}
