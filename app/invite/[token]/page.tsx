import { acceptInviteAction } from '@/lib/server-actions/accept-invite';
import { getOptionalUser } from '@/lib/auth/require-session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const user = await getOptionalUser();
  if (!user) {
    redirect(`/register?invite=${encodeURIComponent(params.token)}`);
  }

  async function accept() {
    'use server';
    const r = await acceptInviteAction(params.token);
    if ('ok' in r) redirect('/home');
    // fall through; the page render will show again (with stale state)
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-5">
      <div className="w-full max-w-sm neo p-5 space-y-3">
        <h1 className="text-xl font-extrabold">接受邀请</h1>
        <p className="text-sm">点击下方按钮接受邀请,与邀请人配对。</p>
        <form action={accept}>
          <button className="neo-btn-primary w-full" type="submit">接受邀请</button>
        </form>
        <Link href="/home" className="text-sm underline">取消</Link>
      </div>
    </main>
  );
}
