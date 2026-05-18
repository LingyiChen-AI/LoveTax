import { requirePaired } from '@/lib/auth/require-session';
import { getTopReasons } from '@/lib/reports/reasons';
import { db } from '@/lib/db/client';

export default async function ReasonsPage({ searchParams }: { searchParams: { target?: string } }) {
  const me = await requirePaired();
  const meRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, me.id) });
  const partner = await db.query.users.findFirst({ where: (u, { and, eq, ne }) => and(eq(u.coupleId, me.coupleId), ne(u.id, me.id)) });
  if (!partner || !meRow) return null;

  const target = searchParams.target === 'partner' ? partner.id : me.id;
  const rows = await getTopReasons(me.coupleId, target, 20);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <a href="/reports/reasons" className={`neo-chip flex-1 ${target === me.id ? 'bg-accent shadow-neo-sm' : ''}`}>我被扣</a>
        <a href="/reports/reasons?target=partner" className={`neo-chip flex-1 ${target === partner.id ? 'bg-accent shadow-neo-sm' : ''}`}>Ta 被扣</a>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-6">暂无数据</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.reason} className="neo px-3 py-2 flex items-center gap-2 text-sm">
              <span className="font-black text-muted w-6">#{i + 1}</span>
              <span className="flex-1 truncate">{r.reason}</span>
              <span className="text-xs font-extrabold">{r.count}×</span>
              <span className="text-danger font-extrabold w-12 text-right">-{r.total}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
