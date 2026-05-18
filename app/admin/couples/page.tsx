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
    <div className="space-y-4">
      <h1 className="text-xs font-extrabold tracking-widest uppercase px-1">情侣 · {all.length}</h1>

      {all.length === 0 ? (
        <p className="text-sm text-muted text-center py-6 neo p-4">还没有配对的情侣</p>
      ) : (
        <>
          <section className="space-y-2 md:hidden">
            {all.map((c) => {
              const members = byCouple.get(c.id) ?? [];
              return (
                <Link key={c.id} href={`/admin/couples/${c.id}`} className="block neo p-3 active:translate-x-[1px] active:translate-y-[1px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-muted">#{c.id.slice(0, 8)}</span>
                    <span className="text-[10px] text-muted">{c.createdAt.toISOString().slice(0, 10)}</span>
                  </div>
                  {members.length ? (
                    <div className="space-y-0.5">
                      {members.map((m, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-extrabold">{m.displayName}</span>
                          <span className="text-xs text-muted ml-2">{m.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">无成员(数据异常)</p>
                  )}
                </Link>
              );
            })}
          </section>

          <section className="hidden md:block">
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
          </section>
        </>
      )}
    </div>
  );
}
