import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-snug tracking-wide backdrop-blur transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/50 bg-primary/20 text-primary",
        secondary: "border-accent/50 bg-accent/20 text-accent",
        outline: "border-border/85 bg-secondary/58 text-foreground/92"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
