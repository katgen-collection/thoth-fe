import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-sm)] font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg shadow-[0_2px_8px_var(--accent-soft)] hover:bg-accent-strong",
        outline:
          "border border-border-strong bg-glass text-fg hover:bg-glass-hover",
        ghost: "text-muted hover:bg-glass-hover hover:text-fg",
        subtle: "bg-accent-soft text-fg hover:bg-glass-hover",
      },
      size: {
        sm: "h-8 px-3 text-[12.5px]",
        md: "h-9 px-3.5 text-[13.5px]",
        lg: "h-10 px-4 text-[14px]",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
