'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRUNCATE_AT = 12; // ~CJK chars beyond which we offer expansion

export function FeedItemReason({
  fromName,
  toName,
  reason
}: {
  fromName: string;
  toName: string;
  reason: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = reason.length > TRUNCATE_AT;

  if (!isLong) {
    return (
      <div className="flex-1 min-w-0 truncate">
        <span className="text-muted">{fromName}→{toName}</span> · {reason}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
      aria-expanded={expanded}
      className={cn(
        'flex-1 min-w-0 text-left flex items-start gap-1.5 group',
        !expanded && 'items-center'
      )}
    >
      <span className={cn('flex-1 min-w-0', !expanded && 'truncate', expanded && 'whitespace-pre-wrap break-words')}>
        <span className="text-muted">{fromName}→{toName}</span> · {reason}
      </span>
      <span className="shrink-0 text-muted mt-0.5 group-hover:text-ink transition-colors">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </span>
    </button>
  );
}
