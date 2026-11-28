import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("bg-panel border border-hairline rounded-lg p-[18px]", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <div
      className={cn(
        "text-[12px] text-text-dim font-mono uppercase tracking-wide mb-2.5",
        className
      )}
      {...props}
    />
  );
}
