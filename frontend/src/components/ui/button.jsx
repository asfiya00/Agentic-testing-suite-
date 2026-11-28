import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-signal text-void hover:bg-[#79A3F5]",
        ghost: "bg-panel-raised border border-hairline text-text hover:border-text-dim",
        outline: "bg-transparent border border-hairline text-text-muted hover:text-text hover:border-text-dim",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "px-2.5 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export function Button({ className, variant, size, ...props }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
