'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInviteAction } from '@/lib/server-actions/accept-invite';

const ERROR_LABEL: Record<string, string> = {
  ALREADY_PAIRED: '你已经有伴侣了,不能再接受邀请。',
  INVITE_INVALID: '邀请无效:可能已过期、已被接受,或邮箱不匹配。',
  CONFLICT: '冲突:邀请已被处理。'
};

export function AcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      const r = await acceptInviteAction(token);
      if ('ok' in r) {
        router.push('/home');
        router.refresh();
      } else {
        setError(ERROR_LABEL[r.error] ?? r.error);
      }
    });
  }

  return (
    <>
      {error && <p className="text-danger text-sm font-bold">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="neo-btn-primary w-full disabled:opacity-50"
      >
        {pending ? '提交中…' : '接受邀请'}
      </button>
    </>
  );
}
