import { cn } from "@/lib/utils";

export function Table({ className, children }) {
  return <table className={cn("w-full border-collapse", className)}>{children}</table>;
}

export function Th({ children, className }) {
  return (
    <th
      className={cn(
        "text-left font-mono text-[10.5px] uppercase tracking-wide text-text-dim font-medium px-3 py-2.5 border-b border-hairline",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }) {
  return (
    <td className={cn("px-3 py-3 border-b border-hairline-soft text-[13px] align-middle", className)}>
      {children}
    </td>
  );
}

export function Tr({ children, className, hover = true, ...props }) {
  return (
    <tr
      className={cn(hover && "hover:bg-panel-raised cursor-pointer", "[&>td]:last:border-b-0", className)}
      {...props}
    >
      {children}
    </tr>
  );
}
