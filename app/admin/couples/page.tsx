import { db } from '@/lib/db/client';
import { couples, users } from '@/lib/db/schema';
import Link from 'next/link';

export default async function AdminCouples() {
  const all = await db.select().from(couples).orderBy(couples.createdAt);
  const allUsers = await db.select().from(users);
  const byCouple = new Map<string, { displayName: string; email: string }[]>();
  for (const u of allUsers) {
    if (!u.coupleId) continue;
    const arr = byCouple.get(u.coupleId) ?? [];
    arr.push({ displayName: u.displayName, email: u.email });
    byCouple.set(u.coupleId, arr);
  }
  return (
    <table className="w-full text-sm border-2 border-ink bg-paper rounded-card overflow-hidden">
      <thead className="bg-bg"><tr><th className="p-2 text-left">配对</th><th className="p-2 text-left">成员</th><th className="p-2 text-left">创建于</th></tr></thead>
      <tbody>
        {all.map((c) => (
          <tr key={c.id} className="border-t border-ink/20">
            <td className="p-2 font-mono text-xs"><Link className="underline" href={`/admin/couples/${c.id}`}>{c.id.slice(0, 8)}</Link></td>
            <td className="p-2">{(byCouple.get(c.id) ?? []).map((u) => `${u.displayName} (${u.email})`).join(' + ')}</td>
            <td className="p-2 text-xs text-muted">{c.createdAt.toISOString().slice(0, 10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
