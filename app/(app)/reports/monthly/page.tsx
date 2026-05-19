import { requirePaired } from '@/lib/auth/require-session';
import { getMonthlySummary } from '@/lib/reports/monthly';
import { db } from '@/lib/db/client';
import { todayInTz } from '@/lib/date';

function thisMonth(tz: string) {
  return todayInTz(tz).slice(0, 7);
}
function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function MonthlyPage({ searchParams }: { searchParams: { month?: string } }) {
  const me = await requirePaired();
  const meRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, me.id) });
  if (!meRow) return null;
  const month = searchParams.month ?? thisMonth(meRow.timezone);
  const prev = previousMonth(month);
  const next = month >= thisMonth(meRow.timezone) ? null : (() => {
    const [y, m] = month.split('-').map(Number);
    const date = new Date(Date.UTC(y, m, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  })();

  const summary = await getMonthlySummary(me.coupleId, me.id, month);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <a href={`/reports/monthly?month=${prev}`} className="neo-chip px-3">← {prev}</a>
        <span className="font-black">{month}</span>
        {next ? <a href={`/reports/monthly?month=${next}`} className="neo-chip px-3">{next} →</a> : <span className="w-16" />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="冲突天数" value={`${summary.conflictCount}/${summary.daysInMonth}`} />
        <Stat label="平均剩余" value={`${summary.avgRemaining}`} />
        <Stat label="最坏" value={summary.worstDay ? `${summary.worstDay.date.slice(5)} · ${summary.worstDay.remaining}` : '—'} />
        <Stat label="最好" value={summary.bestDay ? `${summary.bestDay.date.slice(5)} · ${summary.bestDay.remaining}` : '—'} />
        <Stat label="和谐率" value={`${Math.round(summary.harmonyRate * 100)}%`} className="col-span-2" />
        <Stat label="被夸次数" value={`${summary.praiseCount}`} />
        <Stat label="被夸总分" value={`+${summary.praisePointsTotal}`} />
      </div>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`neo p-3 ${className ?? ''}`}>
      <div className="text-[10px] font-extrabold tracking-widest uppercase text-muted">{label}</div>
      <div className="text-xl font-black mt-1">{value}</div>
    </div>
  );
}
