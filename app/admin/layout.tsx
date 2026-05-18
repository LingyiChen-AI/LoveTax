import { requireAdmin } from '@/lib/auth/require-session';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/lib/server-actions/logout';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/logo';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-30 bg-bg border-b-2 border-ink">
        <div className="max-w-3xl mx-auto px-3 py-2 flex items-center gap-2">
          <Link href="/admin/users" className="shrink-0"><Logo size="sm" showWordmark={false} /></Link>
          <nav className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 flex-1">
            <Link href="/admin/users" className="neo-chip px-3 py-1.5 text-xs shrink-0 bg-paper">用户</Link>
            <Link href="/admin/couples" className="neo-chip px-3 py-1.5 text-xs shrink-0 bg-paper">情侣</Link>
            <Link href="/admin/email-failures" className="neo-chip px-3 py-1.5 text-xs shrink-0 bg-paper">邮件失败</Link>
          </nav>
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              title={`退出 (${me.email})`}
              className="bg-paper border-2 border-ink rounded-chip w-9 h-9 flex items-center justify-center shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-3 py-4 pb-12">{children}</main>
    </>
  );
}
