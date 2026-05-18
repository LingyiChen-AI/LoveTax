'use client';
import { useTransition, useState } from 'react';
import { inviteUserAction } from '@/lib/server-actions/invite-user';

export default function InviteForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await inviteUserAction(fd);
          setMsg('ok' in r ? '已发送邀请邮件' : `失败:${r.error}`);
        });
      }}
      className="space-y-3"
    >
      <input className="neo-input w-full" name="inviteeEmail" type="email" placeholder="伴侣的邮箱" required />
      <button className="neo-btn-primary w-full" disabled={pending}>发送邀请</button>
      {msg && <p className="text-sm font-bold">{msg}</p>}
    </form>
  );
}
