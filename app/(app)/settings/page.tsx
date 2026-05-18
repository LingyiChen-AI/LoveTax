import { requireUser } from '@/lib/auth/require-session';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { updateSettingsAction } from '@/lib/server-actions/update-settings';
import { SUPPORTED_TIMEZONES } from '@/lib/timezones';
import { logoutAction } from '@/lib/server-actions/logout';

export default async function Settings() {
  const me = await requireUser();
  const [row] = await db.select().from(users).where(eq(users.id, me.id));

  return (
    <div className="space-y-4">
      <form action={async (fd) => { 'use server'; await updateSettingsAction(fd); }} className="neo p-4 space-y-3">
        <h2 className="font-extrabold">个人</h2>
        <label className="block">
          <span className="text-[10px] font-extrabold tracking-widest uppercase">称呼</span>
          <input className="neo-input w-full" name="displayName" defaultValue={row.displayName} maxLength={20} />
        </label>
        <label className="block">
          <span className="text-[10px] font-extrabold tracking-widest uppercase">时区(影响每日重置时间)</span>
          <select className="neo-input w-full" name="timezone" defaultValue={row.timezone}>
            {SUPPORTED_TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
          <p className="text-[11px] text-muted mt-1">修改时区只影响今日及之后的统计,历史数据不变。</p>
        </label>
        <button className="neo-btn-primary w-full" type="submit">保存</button>
      </form>

      <Link href="/change-password" className="neo p-4 block">
        <h2 className="font-extrabold">修改密码 →</h2>
      </Link>

      <form action={logoutAction}>
        <button className="neo-btn-danger w-full" type="submit">退出登录</button>
      </form>

      {me.role === 'admin' && (
        <Link href="/admin/users" className="neo p-4 block">
          <h2 className="font-extrabold">管理后台 →</h2>
        </Link>
      )}
    </div>
  );
}
