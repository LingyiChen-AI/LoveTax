import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { adminCreateUser } from '@/lib/server-actions/admin/create-user';
import { adminResetPassword } from '@/lib/server-actions/admin/reset-password';

export default async function AdminUsers() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <div className="space-y-4">
      <details className="neo p-4">
        <summary className="font-extrabold cursor-pointer">新建用户</summary>
        <form action={async (fd: FormData) => { 'use server'; await adminCreateUser(fd); }} className="mt-3 space-y-2">
          <input className="neo-input w-full" name="email" type="email" placeholder="邮箱" required />
          <input className="neo-input w-full" name="displayName" placeholder="称呼" required maxLength={20} />
          <input className="neo-input w-full" name="password" type="text" placeholder="密码 ≥8位含字母数字" required />
          <select className="neo-input w-full" name="role" defaultValue="user">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <button className="neo-btn-primary w-full" type="submit">创建</button>
        </form>
      </details>

      <table className="w-full text-sm border-2 border-ink bg-paper rounded-card overflow-hidden">
        <thead className="bg-bg">
          <tr><th className="text-left p-2">Email</th><th className="text-left p-2">称呼</th><th className="text-left p-2">角色</th><th className="text-left p-2">配对</th><th className="text-left p-2">操作</th></tr>
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
    </div>
  );
}
