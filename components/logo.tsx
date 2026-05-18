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
        aria-label="zchat logo"
      >
        {/* Hard offset shadow */}
        <rect x="9" y="9" width="80" height="80" rx="14" fill="#1F2937" />
        {/* Yellow card */}
        <rect
          x="3"
          y="3"
          width="80"
          height="80"
          rx="14"
          fill="#FBBF24"
          stroke="#1F2937"
          strokeWidth="5"
        />
        {/* Ink-black heart */}
        <path
          d="M43 65 C31 57 19 48 19 37 C19 28 27 23 34 26 C39 28 42 32 43 36 C44 32 47 28 52 26 C59 23 67 28 67 37 C67 48 55 57 43 65 Z"
          fill="#1F2937"
          strokeLinejoin="round"
        />
        {/* White minus bar (the "deduction") slicing across the heart */}
        <rect x="25" y="39" width="36" height="7" rx="1.5" fill="#FFFFFF" />
      </svg>
      {showWordmark && (
        <span className={cn(dim.text, 'font-black tracking-tight leading-none')}>
          zchat
        </span>
      )}
    </div>
  );
}
