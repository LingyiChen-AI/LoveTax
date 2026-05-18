import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invitations, users } from '@/lib/db/schema';
import { getOptionalUser } from '@/lib/auth/require-session';
import { logoutAction } from '@/lib/server-actions/logout';
import { Logo } from '@/components/logo';
import { AcceptButton } from './accept-button';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const user = await getOptionalUser();
  if (!user) {
    redirect(`/register?invite=${encodeURIComponent(params.token)}`);
  }

  const [inv] = await db.select().from(invitations).where(eq(invitations.token, params.token)).limit(1);

  const Frame = ({ children }: { children: React.ReactNode }) => (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-5">
      <Logo size="lg" />
      <div className="w-full max-w-sm neo p-5 space-y-3">{children}</div>
    </main>
  );

  // Invite not found in DB
  if (!inv) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">邀请无效</h1>
        <p className="text-sm">这个邀请链接不存在,可能已被删除。</p>
        <Link href="/" className="neo-btn-primary w-full inline-block text-center">回到首页</Link>
      </Frame>
    );
  }

  // Look up inviter for context
  const [inviter] = await db.select().from(users).where(eq(users.id, inv.inviterUserId)).limit(1);
  const inviterName = inviter?.displayName ?? inviter?.email ?? '邀请人';

  // Various invalid states
  if (inv.status === 'accepted') {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">邀请已被接受</h1>
        <p className="text-sm text-muted">这个邀请已被使用过了。</p>
        <Link href="/" className="neo-btn-primary w-full inline-block text-center">回到首页</Link>
      </Frame>
    );
  }
  if (inv.status === 'expired' || inv.expiresAt < new Date()) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">邀请已过期</h1>
        <p className="text-sm text-muted">请让 {inviterName} 重新发一份邀请。</p>
        <Link href="/" className="neo-btn-primary w-full inline-block text-center">回到首页</Link>
      </Frame>
    );
  }

  // Self-accept
  if (inv.inviterUserId === user.id) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">这是你自己发出的邀请</h1>
        <p className="text-sm">受邀邮箱: <b>{inv.inviteeEmail}</b></p>
        <p className="text-sm text-muted">让对方用这个邮箱注册或登录后,再打开这个链接接受邀请。</p>
        <Link href="/" className="neo-btn-primary w-full inline-block text-center">回到首页</Link>
      </Frame>
    );
  }

  // Email mismatch
  if (inv.inviteeEmail.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">邮箱不匹配</h1>
        <p className="text-sm">{inviterName} 邀请的是 <b>{inv.inviteeEmail}</b></p>
        <p className="text-sm">你当前登录的是 <b>{user.email}</b></p>
        <p className="text-sm text-muted">先退出当前账号,再用受邀邮箱登录或注册。</p>
        <form action={logoutAction}>
          <button type="submit" className="neo-btn-primary w-full">退出当前账号</button>
        </form>
        <Link href="/" className="block text-center text-sm underline">取消</Link>
      </Frame>
    );
  }

  // Accepter is already paired
  if (user.coupleId) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">你已经有伴侣</h1>
        <p className="text-sm text-muted">已配对的用户不能接受新邀请。</p>
        <Link href="/home" className="neo-btn-primary w-full inline-block text-center">回到主页</Link>
      </Frame>
    );
  }

  // Inviter happens to have paired with someone else in the meantime
  if (inviter?.coupleId) {
    return (
      <Frame>
        <h1 className="text-xl font-extrabold">邀请人已配对</h1>
        <p className="text-sm text-muted">{inviterName} 已经和其他人配对了。</p>
        <Link href="/" className="neo-btn-primary w-full inline-block text-center">回到首页</Link>
      </Frame>
    );
  }

  // Happy path
  return (
    <Frame>
      <h1 className="text-xl font-extrabold">接受邀请</h1>
      <div className="text-sm space-y-1">
        <p>邀请人: <b>{inviterName}</b></p>
        <p>受邀邮箱: <b>{inv.inviteeEmail}</b></p>
      </div>
      <p className="text-sm text-muted">点击下方按钮,与 {inviterName} 配对。配对后无法解除。</p>
      <AcceptButton token={params.token} />
      <Link href="/" className="block text-center text-sm underline text-muted">取消</Link>
    </Frame>
  );
}
