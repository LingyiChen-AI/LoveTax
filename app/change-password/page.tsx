import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Logo } from '@/components/logo';
import { ChangePasswordForm } from './form';

export default async function ChangePasswordPage() {
  const session = await auth();
  const sUser: any = session?.user;
  if (!sUser?.id) redirect('/login');

  const [user] = await db.select().from(users).where(eq(users.id, sUser.id)).limit(1);
  if (!user) redirect('/login');

  const forced = !!user.mustChangePassword;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-5">
      <Logo size="lg" />
      <div className="w-full max-w-sm neo p-5 space-y-2">
        <h1 className="text-lg font-semibold text-ink">{forced ? '请设置新密码' : '修改密码'}</h1>
        {forced && (
          <p className="text-sm text-muted">
            管理员为你重置了临时密码,现在请设置一个你自己的密码。
          </p>
        )}
        <div className="pt-2">
          <ChangePasswordForm forced={forced} email={user.email} />
        </div>
      </div>
    </main>
  );
}
