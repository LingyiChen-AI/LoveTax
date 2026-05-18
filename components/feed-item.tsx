import { cn } from '@/lib/utils';

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
      'neo px-3 py-2 flex items-center gap-2 text-sm',
      item.voided && 'opacity-50 line-through'
    )}>
      <div className="text-xs text-muted shrink-0 w-12">{timeOnly(item.occurredAt)}</div>
      <div className="font-extrabold text-danger shrink-0 w-12">-{item.points}</div>
      <div className="flex-1 truncate">
        <span className="text-muted">{item.fromName}→{item.toName}</span> · {item.reason}
      </div>
      {actions}
    </div>
  );
}
