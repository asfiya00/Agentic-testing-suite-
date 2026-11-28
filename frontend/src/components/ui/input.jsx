import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full bg-void border border-hairline rounded-md px-3 py-2.5 text-[13px] font-mono text-text placeholder:text-text-dim focus:outline-none focus:border-signal transition-colors",
        className
      )}
      {...props}
    />
  );
}
