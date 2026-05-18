import { requireUser } from '@/lib/auth/require-session';
import { redirect } from 'next/navigation';

export default async function Onboarding() {
  const user = await requireUser();
  if (user.coupleId) redirect('/home');
  return (
    <div className="neo p-5 mt-10">
      <h1 className="text-xl font-extrabold mb-2">欢迎,{user.name}</h1>
      <p className="text-sm">先邀请你的伴侣加入。(邀请功能在 Task 22 实装)</p>
    </div>
  );
}
