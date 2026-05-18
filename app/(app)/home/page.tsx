import { requirePaired } from '@/lib/auth/require-session';
import { getCoupleTodayView } from '@/lib/reports/today';
import { db } from '@/lib/db/client';
import { VsDisplay } from '@/components/vs-display';
import { DeductSheet } from '@/components/deduct-sheet';
import { FeedList } from '@/components/feed-list';
import type { FeedItemViewModel } from '@/components/feed-item';
import { todayInTz } from '@/lib/date';

export default async function Home() {
  const me = await requirePaired();
  const view = await getCoupleTodayView(me.coupleId, me.id);
  const partnerRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, view.partner.id) });
  const myRow = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, me.id) });
  const partnerTz = partnerRow?.timezone ?? 'Asia/Shanghai';
  const today = todayInTz(partnerTz);

  const items: FeedItemViewModel[] = view.feed.map((f) => ({
    id: f.id,
    fromName: f.fromUserId === me.id ? (myRow?.displayName ?? 'Me') : (partnerRow?.displayName ?? 'Ta'),
    toName: f.toUserId === me.id ? (myRow?.displayName ?? 'Me') : (partnerRow?.displayName ?? 'Ta'),
    points: f.points,
    reason: f.reason,
    occurredAt: f.occurredAt,
    voided: !!f.voidedAt,
    isMine: f.fromUserId === me.id,
    canVoid: f.fromUserId === me.id && !f.voidedAt && f.occurredLocalDate === today
  }));

  return (
    <div className="space-y-4">
      <VsDisplay
        meLabel={`我 · ${myRow?.displayName ?? ''}`}
        meRemaining={view.me.remaining}
        partnerLabel={`Ta · ${partnerRow?.displayName ?? ''}`}
        partnerRemaining={view.partner.remaining}
      />
      <DeductSheet partnerRemaining={view.partner.remaining} />
      <div>
        <h2 className="text-xs font-extrabold tracking-widest uppercase mb-2">战报</h2>
        <FeedList items={items} />
      </div>
    </div>
  );
}
