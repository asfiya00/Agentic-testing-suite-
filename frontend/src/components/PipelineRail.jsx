import { cn } from "@/lib/utils";

const dotStyles = {
  done: "border-pass text-pass bg-pass-dim",
  running: "border-warn text-warn shadow-[0_0_0_5px_var(--color-warn-dim)] pulse-ring",
  fail: "border-crit text-crit bg-crit-dim",
  pending: "border-hairline text-text-dim bg-void",
};

const statusText = {
  done: "text-pass",
  running: "text-warn",
  fail: "text-crit",
  pending: "text-text-dim",
};

const glyph = { done: "✓", running: "•", fail: "✕", pending: "" };

export function PipelineRail({ nodes, title = "Current pipeline" }) {
  return (
    <div className="bg-panel border border-hairline rounded-lg px-6 py-5 mb-5 overflow-x-auto">
      {title && (
        <div className="font-mono text-[12px] text-text-dim uppercase tracking-wide mb-4">
          {title}
        </div>
      )}
      <div className="flex items-center min-w-[640px]">
        {nodes.map((node, i) => (
          <div key={node.name} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-[150px]">
              <div
                className={cn(
                  "w-[38px] h-[38px] rounded-full border-2 flex items-center justify-center font-mono text-[11px] relative",
                  dotStyles[node.status]
                )}
              >
                {glyph[node.status] || node.name[0]}
              </div>
              <div className="text-[12px] font-semibold">{node.name}</div>
              <div className={cn("font-mono text-[10px] uppercase tracking-wide", statusText[node.status])}>
                {node.detail}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 -mt-6 relative min-w-6",
                  node.status === "done" && nodes[i + 1].status === "done"
                    ? "bg-pass"
                    : "bg-hairline",
                  node.status === "done" && nodes[i + 1].status === "running" && "rail-travel"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
