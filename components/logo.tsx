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
        <defs>
          <linearGradient id="lt-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6FB5" />
            <stop offset="100%" stopColor="#C77DFF" />
          </linearGradient>
        </defs>
        {/* Pink offset "sticker" shadow */}
        <rect x="11" y="11" width="80" height="80" rx="20" fill="#FFB6E6" />
        {/* White card with subtle outer stroke */}
        <rect x="5" y="5" width="80" height="80" rx="20" fill="#FFFFFF" stroke="#FFCDE8" strokeWidth="2" />
        {/* Gradient heart */}
        <path
          d="M45 67 C33 59 21 50 21 39 C21 30 29 25 36 28 C41 30 44 34 45 38 C46 34 49 30 54 28 C61 25 69 30 69 39 C69 50 57 59 45 67 Z"
          fill="url(#lt-heart)"
          strokeLinejoin="round"
        />
        {/* White minus pill across heart */}
        <rect x="27" y="42" width="36" height="6" rx="3" fill="#FFFFFF" />
      </svg>
      {showWordmark && (
        <span className={cn(dim.text, 'font-black tracking-tight leading-none text-pink-grad')}>
          LoveTax
        </span>
      )}
    </div>
  );
}
