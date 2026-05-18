'use client';
import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '@/lib/server-actions/register';

export default function RegisterPage() {
  const [state, action] = useFormState(registerAction, null);
  const inviteToken = useSearchParams().get('invite') ?? '';
  return (
    <form action={action} className="neo p-5 space-y-3">
      <h1 className="text-xl font-extrabold">注册</h1>
      {state?.error && <p className="text-danger text-sm font-bold">{state.error}</p>}
      <input name="inviteToken" type="hidden" defaultValue={inviteToken} />
      <input className="neo-input w-full" name="displayName" placeholder="称呼" required maxLength={20} />
      <input className="neo-input w-full" name="email" type="email" placeholder="邮箱" required />
      <input className="neo-input w-full" name="password" type="password" placeholder="密码 (≥8位含字母数字)" required minLength={8} />
      <button className="neo-btn-primary w-full" type="submit">注册</button>
      <p className="text-sm text-muted">
        已有账号? <Link href="/login" className="underline">登录</Link>
      </p>
    </form>
  );
}
