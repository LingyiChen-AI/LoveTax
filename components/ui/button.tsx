import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-card transition active:opacity-80 disabled:opacity-50 disabled:active:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white',
        danger:  'bg-danger text-white',
        secondary: 'bg-paper text-ink',
        ghost:   'bg-transparent text-ink'
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3.5 text-base'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';
