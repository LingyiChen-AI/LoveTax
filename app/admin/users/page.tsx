import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { adminCreateUser } from '@/lib/server-actions/admin/create-user';
import { adminResetPassword } from '@/lib/server-actions/admin/reset-password';

export default async function AdminUsers() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-xs font-extrabold tracking-widest uppercase mb-2 px-1">用户 · {rows.length}</h1>
        <details className="neo">
          <summary className="px-4 py-2.5 text-sm font-extrabold cursor-pointer select-none flex items-center justify-between">
            <span>+ 新建用户</span>
            <span className="text-xs text-muted font-bold">点开</span>
          </summary>
          <form
            action={async (fd: FormData) => { 'use server'; await adminCreateUser(fd); }}
            className="border-t-2 border-ink p-3 space-y-2"
          >
            <input className="neo-input w-full text-sm" name="email" type="email" placeholder="邮箱" required />
            <input className="neo-input w-full text-sm" name="displayName" placeholder="称呼" required maxLength={20} />
            <input className="neo-input w-full text-sm" name="password" type="text" placeholder="密码 ≥8位含字母数字" required />
            <select className="neo-input w-full text-sm" name="role" defaultValue="user">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
            <button className="neo-btn-primary w-full text-sm" type="submit">创建</button>
          </form>
        </details>
      </section>

      <section className="space-y-2 md:hidden">
        {rows.map((u) => (
          <div key={u.id} className="neo p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-extrabold truncate text-sm">{u.displayName}</div>
                <div className="text-xs text-muted truncate">{u.email}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 border-2 border-ink rounded-chip ${u.role === 'admin' ? 'bg-accent' : 'bg-paper'}`}>{u.role === 'admin' ? '管理员' : '用户'}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 border-2 border-ink rounded-chip ${u.coupleId ? 'bg-healthy/30' : 'bg-paper'}`}>{u.coupleId ? '已配对' : '未配对'}</span>
              </div>
            </div>
            <form action={async () => { 'use server'; await adminResetPassword(u.id); }}>
              <button type="submit" className="w-full text-xs font-bold py-1.5 border-2 border-ink rounded-chip bg-paper hover:bg-bg active:translate-x-[1px] active:translate-y-[1px]">
                重置密码 (发邮件给 {u.email})
              </button>
            </form>
          </div>
        ))}
      </section>

      <section className="hidden md:block">
        <table className="w-full text-sm border-2 border-ink bg-paper rounded-card overflow-hidden">
          <thead className="bg-bg">
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">称呼</th>
              <th className="text-left p-2">角色</th>
              <th className="text-left p-2">配对</th>
              <th className="text-left p-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-ink/20">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.displayName}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.coupleId ? '✓' : '—'}</td>
                <td className="p-2">
                  <form action={async () => { 'use server'; await adminResetPassword(u.id); }}>
                    <button className="text-xs underline" type="submit">重置密码</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
