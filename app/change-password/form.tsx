'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { changePasswordAction } from '@/lib/server-actions/change-password';
import { requestPasswordCodeAction } from '@/lib/server-actions/request-password-code';
import { Button } from '@/components/ui/button';

const ERROR_LABEL: Record<string, string> = {
  WEAK_PASSWORD: '密码太弱(至少 8 位,且包含字母和数字)',
  CODE_REQUIRED: '请先发送并填写验证码',
  CODE_INVALID: '验证码无效或已过期',
  RATE_LIMITED: '发送太频繁,过会儿再试',
  UNAUTHORIZED: '未登录',
  NOT_FOUND: '账号不存在'
};

function SubmitButton({ forced }: { forced: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? '提交中…' : forced ? '设置新密码' : '修改密码'}
    </Button>
  );
}

export function ChangePasswordForm({ forced, email }: { forced: boolean; email: string }) {
  const [state, action] = useFormState(changePasswordAction, null);
  const [sendPending, startSend] = useTransition();
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [sendErr, setSendErr] = useState<string | null>(null);

  function sendCode() {
    setSendMsg(null);
    setSendErr(null);
    startSend(async () => {
      const r = await requestPasswordCodeAction();
      if ('ok' in r) setSendMsg(`已发送到 ${r.email},10 分钟内有效`);
      else setSendErr(ERROR_LABEL[r.error] ?? r.error);
    });
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted mb-1.5">新密码</label>
        <input
          className="neo-input w-full"
          name="newPassword"
          type="password"
          placeholder="至少 8 位,含字母和数字"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {!forced && (
        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5">邮箱验证码</label>
          <div className="flex gap-2">
            <input
              className="neo-input flex-1 tracking-widest font-mono"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6 位数字"
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={sendCode}
              disabled={sendPending}
              className="shrink-0 whitespace-nowrap"
            >
              {sendPending ? '发送中…' : '发送验证码'}
            </Button>
          </div>
          <p className="text-xs text-muted mt-1.5">
            验证码会发到 <span className="font-semibold text-ink">{email}</span>
          </p>
          {sendMsg && <p className="text-xs font-semibold text-healthy mt-2">{sendMsg}</p>}
          {sendErr && <p className="text-xs font-semibold text-danger mt-2">{sendErr}</p>}
        </div>
      )}

      {state?.error && (
        <p className="text-sm font-semibold text-danger">
          {ERROR_LABEL[state.error] ?? state.error}
        </p>
      )}

      <SubmitButton forced={forced} />

      {!forced && (
        <Link href="/" className="block text-center text-sm text-muted">
          取消
        </Link>
      )}
    </form>
  );
}
