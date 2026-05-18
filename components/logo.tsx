import { cn } from '@/lib/utils';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: 28, gap: 'gap-1.5', text: 'text-base' },
  md: { box: 44, gap: 'gap-2.5', text: 'text-2xl' },
  lg: { box: 64, gap: 'gap-3', text: 'text-3xl' }
};

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const dim = SIZES[size];
  return (
    <div className={cn('inline-flex items-center', dim.gap, className)}>
      <svg
        width={dim.box}
        height={dim.box}
        viewBox="0 0 96 96"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LoveTax logo"
      >
        {/* Hard offset shadow */}
        <rect x="11" y="11" width="80" height="80" rx="14" fill="#1F2937" />
        {/* Yellow card */}
        <rect
          x="5"
          y="5"
          width="80"
          height="80"
          rx="14"
          fill="#FBBF24"
          stroke="#1F2937"
          strokeWidth="5"
        />
        {/* Ink-black heart */}
        <path
          d="M45 67 C33 59 21 50 21 39 C21 30 29 25 36 28 C41 30 44 34 45 38 C46 34 49 30 54 28 C61 25 69 30 69 39 C69 50 57 59 45 67 Z"
          fill="#1F2937"
          strokeLinejoin="round"
        />
        {/* White minus bar (the "deduction") slicing across the heart */}
        <rect x="27" y="41" width="36" height="7" rx="1.5" fill="#FFFFFF" />
      </svg>
      {showWordmark && (
        <span className={cn(dim.text, 'font-black tracking-tight leading-none')}>
          LoveTax
        </span>
      )}
    </div>
  );
}
