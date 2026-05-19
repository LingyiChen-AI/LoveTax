import { cn } from '@/lib/utils';

export interface HpCardProps {
  label: string;
  remaining: number;
  variant?: 'self' | 'partner';
  compact?: boolean;
}

export function HpCard({ label, remaining, variant = 'self', compact = false }: HpCardProps) {
  const pct = Math.max(0, Math.min(100, remaining));
  const isSelf = variant === 'self';
  return (
    <div
      className={cn(
        'bg-paper rounded-card border-2 border-white',
        isSelf ? 'shadow-neo' : 'shadow-neo-blue',
        compact ? 'p-3' : 'p-4 pb-3'
      )}
    >
      <div className="text-[10px] font-extrabold tracking-widest uppercase text-muted">{label}</div>
      <div
        className={cn(
          'font-black leading-none mt-1',
          compact ? 'text-3xl' : 'text-4xl',
          isSelf ? 'text-pink-grad' : 'text-sky-grad'
        )}
      >
        {pct}
        <span className="text-sm text-muted ml-1 font-bold">/100</span>
      </div>
      <div
        className={cn(
          'mt-2 h-2.5 rounded-full overflow-hidden border-2 border-white',
          isSelf ? 'bg-pink/10' : 'bg-sky/10'
        )}
      >
        <div
          className={cn('h-full', isSelf ? 'bg-pink-grad' : 'bg-sky-grad')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
