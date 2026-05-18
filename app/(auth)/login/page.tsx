'use client';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { loginAction } from '@/lib/server-actions/login';

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, null);
  return (
    <form action={action} className="neo p-5 space-y-3">
      <h1 className="text-xl font-extrabold">登录</h1>
      {state?.error && <p className="text-danger text-sm font-bold">{state.error}</p>}
      <input className="neo-input w-full" name="email" type="email" placeholder="邮箱" required />
      <input className="neo-input w-full" name="password" type="password" placeholder="密码" required />
      <button className="neo-btn-primary w-full" type="submit">登录</button>
      <p className="text-sm text-muted">
        没有账号? <Link href="/register" className="underline">注册</Link>
      </p>
    </form>
  );
}
