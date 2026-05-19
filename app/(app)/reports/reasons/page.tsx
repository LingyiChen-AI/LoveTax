import { requirePaired } from '@/lib/auth/require-session';
import { getTopReasons } from '@/lib/reports/reasons';
import { db } from '@/lib/db/client';

type Mode = 'me-deduct' | 'partner-deduct' | 'me-bonus' | 'partner-bonus';

const MODES: { key: Mode; label: string }[] = [
  { key: 'me-deduct', label: '我被扣' },
  { key: 'partner-deduct', label: 'Ta 被扣' },
  { key: 'me-bonus', label: '我被夸' },
  { key: 'partner-bonus', label: 'Ta 被夸' }
];

export default async function ReasonsPage({ searchParams }: { searchParams: { mode?: string } }) {
  const me = await requirePaired();
  const meRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, me.id) });
  const partner = await db.query.users.findFirst({ where: (u, { and, eq, ne }) => and(eq(u.coupleId, me.coupleId), ne(u.id, me.id)) });
  if (!partner || !meRow) return null;

  const modeKey: Mode = (MODES.find((m) => m.key === searchParams.mode)?.key ?? 'me-deduct');
  const targetId = modeKey.startsWith('me-') ? me.id : partner.id;
  const kind: 'deduct' | 'bonus' = modeKey.endsWith('deduct') ? 'deduct' : 'bonus';

  const rows = await getTopReasons(me.coupleId, targetId, 20, kind);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {MODES.map((m) => (
          <a
            key={m.key}
            href={`/reports/reasons?mode=${m.key}`}
            className={`neo-chip shrink-0 ${modeKey === m.key ? 'bg-accent text-white' : ''}`}
          >
            {m.label}
          </a>
        ))}
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
              <span className={`font-extrabold w-12 text-right ${kind === 'bonus' ? 'text-healthy' : 'text-danger'}`}>
                {kind === 'bonus' ? '+' : '-'}{r.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
