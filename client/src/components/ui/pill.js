import React from 'react';
import { cn } from '../../lib/utils';

const Pill = ({ className, tone = 'neutral', children, ...props }) => {
  const toneStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    positive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    danger: 'bg-rose-50 text-rose-600 border-rose-200',
    info: 'bg-sky-50 text-sky-600 border-sky-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium',
        toneStyles[tone] || toneStyles.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Pill;
