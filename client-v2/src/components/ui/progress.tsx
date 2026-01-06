"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary/20",
        success: "bg-[oklch(var(--theme-teal)/0.15)]",
        warning: "bg-[oklch(var(--theme-amber)/0.15)]",
        danger: "bg-[oklch(var(--theme-coral)/0.15)]",
      },
      size: {
        sm: "h-1.5",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-[oklch(var(--theme-teal))]",
        warning: "bg-[oklch(var(--theme-amber))]",
        danger: "bg-[oklch(var(--theme-coral))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

function Progress({
  className,
  value,
  variant,
  size,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ variant, size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={indicatorVariants({ variant })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress, progressVariants };
