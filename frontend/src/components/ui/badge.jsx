import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-mono text-[10.5px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium",
  {
    variants: {
      variant: {
        crit: "bg-crit-dim text-crit",
        high: "bg-warn-dim text-warn",
        med: "bg-signal-dim text-signal",
        low: "bg-panel-raised text-text-dim border border-hairline",
        pass: "bg-pass-dim text-pass",
      },
    },
    defaultVariants: { variant: "low" },
  }
);

export function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
