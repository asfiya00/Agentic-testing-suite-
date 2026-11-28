import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, defaultIndex = 0, onChange }) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div className="flex gap-0.5 border-b border-hairline mb-4.5">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => {
            setActive(i);
            onChange?.(i);
          }}
          className={cn(
            "px-4 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px transition-colors",
            active === i
              ? "text-text border-signal"
              : "text-text-dim border-transparent hover:text-text-muted"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
