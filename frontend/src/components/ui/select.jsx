import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full bg-void border border-hairline rounded-md px-3 py-2.5 text-[13px] font-mono text-text focus:outline-none focus:border-signal transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
