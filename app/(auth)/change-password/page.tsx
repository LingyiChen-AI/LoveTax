'use client';
import { useFormState } from 'react-dom';
import { changePasswordAction } from '@/lib/server-actions/change-password';

export default function ChangePasswordPage({ searchParams }: { searchParams: { forced?: string } }) {
  const [state, action] = useFormState(changePasswordAction, null);
  const forced = !!searchParams.forced;
  return (
    <form action={action} className="neo p-5 space-y-3">
      <h1 className="text-xl font-extrabold">{forced ? '请设置新密码' : '修改密码'}</h1>
      {state?.error && <p className="text-danger text-sm font-bold">{state.error}</p>}
      {!forced && (
        <input className="neo-input w-full" name="currentPassword" type="password" placeholder="当前密码" required />
      )}
      <input className="neo-input w-full" name="newPassword" type="password" placeholder="新密码 (≥8位含字母数字)" required minLength={8} />
      <button className="neo-btn-primary w-full" type="submit">保存</button>
    </form>
  );
}
