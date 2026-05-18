import { requireUser } from '@/lib/auth/require-session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/client';
import { invitations } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import InviteForm from './invite-form';
import { Logo } from '@/components/logo';

export default async function Onboarding() {
  const user = await requireUser();
  if (user.role === 'admin') redirect('/admin/users');
  if (user.coupleId) redirect('/home');

  const pending = await db.select().from(invitations).where(
    and(eq(invitations.inviterUserId, user.id), eq(invitations.status, 'pending'), gt(invitations.expiresAt, new Date()))
  ).limit(1);

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-center mb-2"><Logo size="md" /></div>
      <div className="neo p-5">
        <h1 className="text-xl font-extrabold mb-2">欢迎,{user.name}</h1>
        <p className="text-sm text-muted">邀请你的伴侣加入,才能开始扣分对决。</p>
      </div>
      <div className="neo p-5">
        {pending.length ? (
          <>
            <p className="font-bold mb-2">已邀请 {pending[0].inviteeEmail}</p>
            <p className="text-sm text-muted">等待对方接受。可以重发,会复用同一邀请。</p>
            <div className="mt-3"><InviteForm /></div>
          </>
        ) : (
          <InviteForm />
        )}
      </div>
    </div>
  );
}
