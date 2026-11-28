import { useState } from "react";
import { cn } from "@/lib/utils";

export function Switch({ defaultChecked = false, onCheckedChange, className }) {
  const [checked, setChecked] = useState(defaultChecked);

  function toggle() {
    const next = !checked;
    setChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className={cn(
        "w-[38px] h-[22px] rounded-full relative flex-shrink-0 transition-colors",
        checked ? "bg-signal" : "bg-hairline",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-[18px] h-[18px] rounded-full transition-all",
          checked ? "left-[18px] bg-void" : "left-0.5 bg-text"
        )}
      />
    </button>
  );
}

export function SwitchRow({ label, desc, defaultChecked, right }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-hairline-soft last:border-b-0">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {desc && <div className="text-[11.5px] text-text-dim mt-0.5">{desc}</div>}
      </div>
      {right ?? <Switch defaultChecked={defaultChecked} />}
    </div>
  );
}
