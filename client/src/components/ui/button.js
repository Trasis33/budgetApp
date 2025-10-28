import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'rounded-2xl bg-slate-900 px-5 py-2.5 text-sm text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/10 before:content-[\'\']',
        secondary:
          'rounded-2xl bg-slate-100 px-5 py-2.5 text-sm text-slate-900 shadow-sm hover:bg-slate-200',
        soft:
          'rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2.5 text-sm text-white shadow-lg shadow-slate-900/15 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800',
        outline:
          'rounded-2xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        ghost:
          'rounded-2xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100',
        pill:
          'rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        subtle:
          'rounded-2xl bg-white px-5 py-2.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
