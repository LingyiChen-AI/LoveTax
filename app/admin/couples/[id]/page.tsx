import { db } from '@/lib/db/client';
import { deductions, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

function fmtTime(d: Date) {
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

export default async function CoupleDetail({ params }: { params: { id: string } }) {
  const rows = await db.select().from(deductions).where(eq(deductions.coupleId, params.id)).orderBy(desc(deductions.occurredAt)).limit(200);
  const allUsers = await db.select().from(users).where(eq(users.coupleId, params.id));
  const nameById = new Map(allUsers.map((u) => [u.id, u.displayName]));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Link href="/admin/couples" className="text-xs underline">← 返回</Link>
        <span className="font-mono text-[10px] text-muted">#{params.id.slice(0, 8)}</span>
      </div>
      <h1 className="text-xs font-extrabold tracking-widest uppercase px-1">扣分历史 · {rows.length}</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-6 neo p-4">暂无扣分记录</p>
      ) : (
        <>
          <section className="space-y-2 md:hidden">
            {rows.map((r) => {
              const voided = !!r.voidedAt;
              return (
                <div key={r.id} className={`neo p-3 ${voided ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted">{fmtTime(r.occurredAt)}</span>
                    <span className={`text-lg font-black ${voided ? 'line-through' : 'text-danger'}`}>-{r.points}</span>
                  </div>
                  <div className="text-xs font-bold mt-0.5">{nameById.get(r.fromUserId) ?? '?'} → {nameById.get(r.toUserId) ?? '?'}</div>
                  <div className={`text-sm mt-1 break-words ${voided ? 'line-through' : ''}`}>{r.reason}</div>
                  {voided && <div className="text-[10px] text-muted mt-1">已撤销</div>}
                </div>
              );
            })}
          </section>

          <section className="hidden md:block">
            <table className="w-full text-xs border-2 border-ink bg-paper rounded-card overflow-hidden">
              <thead className="bg-bg"><tr><th className="p-2 text-left">时间</th><th className="p-2 text-left">From → To</th><th className="p-2 text-left">分</th><th className="p-2 text-left">原因</th><th className="p-2 text-left">状态</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={`border-t border-ink/20 ${r.voidedAt ? 'opacity-50' : ''}`}>
                    <td className="p-2">{fmtTime(r.occurredAt)}</td>
                    <td className="p-2">{nameById.get(r.fromUserId)} → {nameById.get(r.toUserId)}</td>
                    <td className="p-2 text-danger font-extrabold">-{r.points}</td>
                    <td className="p-2 truncate max-w-xs">{r.reason}</td>
                    <td className="p-2">{r.voidedAt ? 'voided' : 'active'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
