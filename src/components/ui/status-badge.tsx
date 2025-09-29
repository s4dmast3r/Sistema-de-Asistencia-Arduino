import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        in: "bg-success-light text-success border border-success/20",
        out: "bg-error-light text-error border border-error/20",
        unknown: "bg-warning-light text-warning border border-warning/20",
        present: "bg-primary/10 text-primary border border-primary/20",
        offline: "bg-muted text-muted-foreground border border-border",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "present",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(statusBadgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };