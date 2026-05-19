import { cn } from '@/lib/utils';

export interface HpCardProps {
  label: string;
  remaining: number;
  compact?: boolean;
}

function statusColor(remaining: number) {
  if (remaining >= 60) return { fill: 'bg-accent', track: 'bg-accent/15' };
  if (remaining >= 30) return { fill: 'bg-warn',   track: 'bg-warn/15' };
  return                       { fill: 'bg-danger', track: 'bg-danger/15' };
}

export function HpCard({ label, remaining, compact = false }: HpCardProps) {
  const pct = Math.max(0, Math.min(100, remaining));
  const { fill, track } = statusColor(pct);
  return (
    <div className={cn('bg-paper rounded-card', compact ? 'p-3' : 'p-4')}>
      <div className="text-xs text-muted font-medium">{label}</div>
      <div className={cn('font-bold leading-none mt-1 text-ink tracking-tight', compact ? 'text-3xl' : 'text-4xl')}>
        {pct}
        <span className="text-sm text-muted ml-1 font-medium">/100</span>
      </div>
      <div className={cn('mt-2.5 h-1 rounded-full overflow-hidden', track)}>
        <div className={cn('h-full rounded-full transition-all', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
