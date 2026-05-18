import { cn } from '@/lib/utils';

export interface HpCardProps {
  label: string;        // e.g. "我" or "Ta"
  remaining: number;    // 0-100
  variant?: 'self' | 'partner';
  compact?: boolean;
}

export function HpCard({ label, remaining, variant = 'self', compact = false }: HpCardProps) {
  const pct = Math.max(0, Math.min(100, remaining));
  const fill = variant === 'self'
    ? 'bg-gradient-to-r from-danger to-accent'
    : 'bg-gradient-to-r from-healthy to-emerald-400';
  const numColor = variant === 'self' ? 'text-danger' : 'text-healthy';
  return (
    <div className={cn('neo', compact ? 'p-3' : 'p-4 pb-3')}>
      <div className="text-[10px] font-extrabold tracking-widest uppercase">{label}</div>
      <div className={cn('font-black leading-none mt-1', compact ? 'text-2xl' : 'text-4xl', numColor)}>
        {pct}
        <span className="text-sm text-muted ml-1">/100</span>
      </div>
      <div className="mt-2 h-2.5 bg-bg border-[1.5px] border-ink rounded-full overflow-hidden">
        <div className={cn('h-full', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
