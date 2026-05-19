'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRUNCATE_AT = 12;

export function ReasonRow({
  rank,
  reason,
  count,
  total,
  kind
}: {
  rank: number;
  reason: string;
  count: number;
  total: number;
  kind: 'deduct' | 'bonus';
}) {
  const isLong = reason.length > TRUNCATE_AT;
  const [expanded, setExpanded] = useState(false);
  const totalColor = kind === 'bonus' ? 'text-healthy' : 'text-danger';
  const sign = kind === 'bonus' ? '+' : '-';

  return (
    <li className="neo px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-black text-muted w-6 shrink-0">#{rank}</span>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex-1 min-w-0 text-left flex items-center gap-1.5 group"
          >
            <span className="flex-1 min-w-0 truncate">
              {expanded ? <span className="text-muted text-xs">展开</span> : reason}
            </span>
            <span className="shrink-0 text-muted group-hover:text-ink transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>
        ) : (
          <span className="flex-1 min-w-0 truncate">{reason}</span>
        )}
        <span className="text-xs font-extrabold text-muted shrink-0">{count}×</span>
        <span className={cn('font-extrabold w-12 text-right shrink-0', totalColor)}>
          {sign}{total}
        </span>
      </div>
      {isLong && expanded && (
        <p className="mt-2 text-sm font-normal text-ink/85 leading-relaxed break-words whitespace-pre-wrap pl-8">
          {reason}
        </p>
      )}
    </li>
  );
}
