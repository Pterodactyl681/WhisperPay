import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 rounded-xl text-center text-sm font-medium leading-snug whitespace-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-primary/45 bg-[linear-gradient(135deg,hsl(var(--primary)_/_0.95),hsl(282_70%_63%_/_0.92))] text-primary-foreground shadow-soft hover:brightness-110",
        secondary: "border border-border/75 bg-secondary/75 text-secondary-foreground backdrop-blur hover:bg-secondary/95",
        outline: "border border-border/85 bg-background/35 backdrop-blur hover:border-primary/45 hover:bg-primary/10",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "min-h-10 px-4 py-2.5",
        sm: "min-h-9 px-3 py-2",
        lg: "min-h-11 px-8 py-3",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
