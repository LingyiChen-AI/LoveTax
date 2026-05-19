import { cn } from '@/lib/utils';
import { FeedItemReason } from './feed-item-reason';

export interface FeedItemViewModel {
  id: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  occurredAt: Date;
  isMine: boolean;
  kind: 'deduct' | 'bonus';
}

function timeOnly(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function FeedItem({ item }: { item: FeedItemViewModel }) {
  const isBonus = item.kind === 'bonus';
  return (
    <div className={cn('neo px-3 py-2 flex items-start gap-2 text-sm')}>
      <div className="text-xs text-muted shrink-0 w-12 pt-0.5">{timeOnly(item.occurredAt)}</div>
      <div
        className={cn(
          'font-extrabold shrink-0 w-12',
          isBonus ? 'text-healthy' : 'text-danger'
        )}
      >
        {isBonus ? `+${item.points}` : `-${item.points}`}
      </div>
      <FeedItemReason fromName={item.fromName} toName={item.toName} reason={item.reason} />
    </div>
  );
}
