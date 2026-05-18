import { requirePaired } from '@/lib/auth/require-session';
import { getTrend } from '@/lib/reports/trend';
import { db } from '@/lib/db/client';
import { TrendChart } from '@/components/trend-chart';
import Link from 'next/link';

export default async function TrendPage({ searchParams }: { searchParams: { days?: string } }) {
  const me = await requirePaired();
  const days = searchParams.days === '30' ? 30 : 7;
  const meRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, me.id) });
  const partner = await db.query.users.findFirst({ where: (u, { and, eq, ne }) => and(eq(u.coupleId, me.coupleId), ne(u.id, me.id)) });
  if (!partner || !meRow) return null;

  const data = await getTrend(me.coupleId, me.id, meRow.timezone, partner.id, partner.timezone, days);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Link href="/reports/trend?days=7" className={`neo-chip flex-1 ${days === 7 ? 'bg-accent shadow-neo-sm' : ''}`}>7 天</Link>
        <Link href="/reports/trend?days=30" className={`neo-chip flex-1 ${days === 30 ? 'bg-accent shadow-neo-sm' : ''}`}>30 天</Link>
      </div>
      <TrendChart data={data} meLabel={`我 · ${meRow.displayName}`} partnerLabel={`Ta · ${partner.displayName}`} />
    </div>
  );
}
