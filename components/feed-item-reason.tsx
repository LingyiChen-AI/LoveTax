'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TRUNCATE_AT = 12;

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
  const prefix = `${fromName}→${toName}`;

  if (!isLong) {
    return (
      <div className="flex-1 min-w-0 truncate">
        <span className="text-muted">{prefix}</span> · {reason}
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        aria-expanded={expanded}
        className="w-full text-left flex items-center gap-1.5 group"
      >
        <span className="flex-1 min-w-0 truncate">
          <span className="text-muted">{prefix}</span>
          {!expanded && <> · {reason}</>}
        </span>
        <span className="shrink-0 text-muted group-hover:text-ink transition-colors">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {expanded && (
        <p className="mt-1 text-xs font-normal text-ink/85 leading-relaxed break-words whitespace-pre-wrap">
          {reason}
        </p>
      )}
    </div>
  );
}
