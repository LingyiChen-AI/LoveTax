import { cn } from '@/lib/utils';
import { FeedItemReason } from './feed-item-reason';

export interface FeedItemViewModel {
  id: string;
  fromName: string;
  toName: string;
  points: number;
  reason: string;
  occurredAt: Date;
  voided: boolean;
  isMine: boolean;   // I am the from_user
  canVoid: boolean;
}

function timeOnly(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function FeedItem({ item, actions }: { item: FeedItemViewModel; actions?: React.ReactNode }) {
  return (
    <div className={cn(
      'neo px-3 py-2 flex items-start gap-2 text-sm',
      item.voided && 'opacity-50 line-through'
    )}>
      <div className="text-xs text-muted shrink-0 w-12 pt-0.5">{timeOnly(item.occurredAt)}</div>
      <div className="font-extrabold text-danger shrink-0 w-12">-{item.points}</div>
      <FeedItemReason fromName={item.fromName} toName={item.toName} reason={item.reason} />
      {actions && <div className="shrink-0 pt-0.5">{actions}</div>}
    </div>
  );
}
