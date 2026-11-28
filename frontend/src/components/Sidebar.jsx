import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Plus,
  Terminal,
  Search,
  Wrench,
  TrendingUp,
  History,
  Settings,
} from "lucide-react";
import { nav } from "@/data/mock";
import { cn } from "@/lib/utils";

// lucide-react dropped the GitHub mark for trademark reasons — use the
// standard octocat glyph directly so the sidebar still reads correctly.
function GithubGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.79 10.79.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.17.69-3.84-1.35-3.84-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.53-.29-5.19-1.27-5.19-5.63 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.73 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.34-5.21 5.62.41.36.77 1.06.77 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
    </svg>
  );
}

const icons = {
  grid: LayoutGrid,
  plus: Plus,
  terminal: Terminal,
  search: Search,
  wrench: Wrench,
  trend: TrendingUp,
  github: GithubGlyph,
  history: History,
  settings: Settings,
};

export function Sidebar() {
  return (
    <aside className="bg-panel border-r border-hairline flex flex-col p-3.5 sticky top-0 h-screen overflow-y-auto w-[236px]">
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <div className="w-6.5 h-6.5 rounded-md bg-gradient-to-br from-signal to-pass relative flex-shrink-0">
          <div className="absolute inset-1.5 rounded-sm bg-void" />
        </div>
        <div>
          <div className="font-display font-semibold text-[16px] tracking-tight">Sentinel</div>
          <div className="font-mono text-[10px] text-text-dim uppercase tracking-widest -mt-0.5">
            Agent QA Console
          </div>
        </div>
      </div>

      {nav.map((group) => (
        <div key={group.label} className="mb-4.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-dim px-2.5 mb-1.5">
            {group.label}
          </div>
          {group.items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-text-muted transition-colors relative",
                    isActive
                      ? "bg-signal-dim text-signal before:content-[''] before:absolute before:-left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-signal before:rounded-full"
                      : "hover:bg-panel-raised hover:text-text"
                  )
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0 opacity-90" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto font-mono text-[10px] bg-crit-dim text-crit px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="mt-auto pt-3.5 border-t border-hairline">
        <div className="flex items-center gap-2 p-2 rounded-md bg-panel-raised border border-hairline">
          <span className="w-1.5 h-1.5 rounded-full bg-pass shadow-[0_0_0_3px_var(--color-pass-dim)] flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-mono text-[11px] truncate">acme/storefront-web</div>
            <div className="text-[10px] text-text-dim">main · connected</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
