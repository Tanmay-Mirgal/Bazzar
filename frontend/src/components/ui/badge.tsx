import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-black',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-black text-white hover:bg-zinc-800',
        secondary:
          'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline:
          'text-zinc-900 border-zinc-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
