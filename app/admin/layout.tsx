import { requireAdmin } from '@/lib/auth/require-session';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <main className="min-h-dvh max-w-3xl mx-auto p-4">
      <nav className="flex gap-2 mb-4">
        <Link href="/admin/users" className="neo-chip px-3">用户</Link>
        <Link href="/admin/couples" className="neo-chip px-3">情侣</Link>
        <Link href="/admin/email-failures" className="neo-chip px-3">邮件失败</Link>
      </nav>
      {children}
    </main>
  );
}
