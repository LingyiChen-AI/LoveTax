'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const TRUNCATE_AT = 12;

function timeOnly(d: Date) {
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function FeedItem({ item }: { item: FeedItemViewModel }) {
  const isBonus = item.kind === 'bonus';
  const prefix = `${item.fromName}→${item.toName}`;
  const isLong = item.reason.length > TRUNCATE_AT;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn('neo px-3 py-2 text-sm')}>
      <div className="flex items-start gap-2">
        <div className="text-xs text-muted shrink-0 w-12 pt-0.5">{timeOnly(item.occurredAt)}</div>
        <div className={cn('font-extrabold shrink-0 w-12', isBonus ? 'text-healthy' : 'text-danger')}>
          {isBonus ? `+${item.points}` : `-${item.points}`}
        </div>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex-1 min-w-0 text-left flex items-center gap-1.5 group"
          >
            <span className="flex-1 min-w-0 truncate">
              <span className="text-muted">{prefix}</span>
              {!expanded && <> · {item.reason}</>}
            </span>
            <span className="shrink-0 text-muted group-hover:text-ink transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
        ) : (
          <div className="flex-1 min-w-0 truncate">
            <span className="text-muted">{prefix}</span> · {item.reason}
          </div>
        )}
      </div>
      {isLong && expanded && (
        <p className="mt-2 text-sm font-normal text-ink/85 leading-relaxed break-words whitespace-pre-wrap">
          {item.reason}
        </p>
      )}
    </div>
  );
}
