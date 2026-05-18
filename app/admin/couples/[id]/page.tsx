import { db } from '@/lib/db/client';
import { deductions, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function CoupleDetail({ params }: { params: { id: string } }) {
  const rows = await db.select().from(deductions).where(eq(deductions.coupleId, params.id)).orderBy(desc(deductions.occurredAt)).limit(200);
  const allUsers = await db.select().from(users).where(eq(users.coupleId, params.id));
  const nameById = new Map(allUsers.map((u) => [u.id, u.displayName]));
  return (
    <div className="space-y-2">
      <h1 className="font-extrabold">扣分历史</h1>
      <table className="w-full text-xs border-2 border-ink bg-paper rounded-card overflow-hidden">
        <thead className="bg-bg"><tr><th className="p-2 text-left">时间</th><th className="p-2 text-left">From → To</th><th className="p-2 text-left">分</th><th className="p-2 text-left">原因</th><th className="p-2 text-left">状态</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={`border-t border-ink/20 ${r.voidedAt ? 'opacity-50' : ''}`}>
              <td className="p-2">{r.occurredAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
              <td className="p-2">{nameById.get(r.fromUserId)} → {nameById.get(r.toUserId)}</td>
              <td className="p-2 text-danger font-extrabold">-{r.points}</td>
              <td className="p-2 truncate max-w-xs">{r.reason}</td>
              <td className="p-2">{r.voidedAt ? 'voided' : 'active'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
