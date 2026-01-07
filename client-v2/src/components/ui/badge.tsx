import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[oklch(var(--theme-teal)/0.12)] text-[oklch(var(--theme-teal))] [a&]:hover:bg-[oklch(var(--theme-teal)/0.2)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-[oklch(var(--theme-coral))] text-white [a&]:hover:bg-[oklch(var(--theme-coral)/0.9)] focus-visible:ring-[oklch(var(--theme-coral)/0.2)]",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Semantic status variants for budget/finance context
        success:
          "border-transparent bg-[oklch(var(--theme-teal)/0.12)] text-[oklch(var(--theme-teal))] dark:bg-[oklch(var(--theme-teal)/0.2)]",
        warning:
          "border-transparent bg-[oklch(var(--theme-amber)/0.12)] text-[oklch(var(--theme-amber))] dark:bg-[oklch(var(--theme-amber)/0.2)]",
        danger:
          "border-transparent bg-[oklch(var(--theme-coral)/0.12)] text-[oklch(var(--theme-coral))] dark:bg-[oklch(var(--theme-coral)/0.2)]",
        info:
          "border-transparent bg-[oklch(var(--theme-indigo)/0.12)] text-[oklch(var(--theme-indigo))] dark:bg-[oklch(var(--theme-indigo)/0.2)]",
        highlight:
          "border-transparent bg-[oklch(var(--theme-gold)/0.12)] text-[oklch(var(--theme-gold))] dark:bg-[oklch(var(--theme-gold)/0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
