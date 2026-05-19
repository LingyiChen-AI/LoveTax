import { cn } from '@/lib/utils';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: 28, gap: 'gap-2', text: 'text-base' },
  md: { box: 40, gap: 'gap-2.5', text: 'text-xl' },
  lg: { box: 56, gap: 'gap-3', text: 'text-2xl' }
};

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const dim = SIZES[size];
  return (
    <div className={cn('inline-flex items-center', dim.gap, className)}>
      <svg
        width={dim.box}
        height={dim.box}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LoveTax logo"
      >
        {/* Rounded green app-icon style square */}
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#34C759" />
        {/* White heart */}
        <path
          d="M32 48 C22 41 14 33 14 24 C14 18 19 14 24 16 C28 18 30 20 32 23 C34 20 36 18 40 16 C45 14 50 18 50 24 C50 33 42 41 32 48 Z"
          fill="#FFFFFF"
        />
      </svg>
      {showWordmark && (
        <span className={cn(dim.text, 'font-semibold tracking-tight leading-none text-ink')}>
          LoveTax
        </span>
      )}
    </div>
  );
}
