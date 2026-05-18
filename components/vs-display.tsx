import { HpCard } from './hp-card';

export interface VsDisplayProps {
  meLabel: string;
  meRemaining: number;
  partnerLabel: string;
  partnerRemaining: number;
}

export function VsDisplay({ meLabel, meRemaining, partnerLabel, partnerRemaining }: VsDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1"><HpCard label={meLabel} remaining={meRemaining} variant="self" compact /></div>
      <div className="text-lg font-black tracking-widest">VS</div>
      <div className="flex-1"><HpCard label={partnerLabel} remaining={partnerRemaining} variant="partner" compact /></div>
    </div>
  );
}
