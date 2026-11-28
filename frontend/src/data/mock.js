export const nav = [
  {
    label: "Monitor",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "grid" },
      { to: "/launcher", label: "New scan", icon: "plus" },
      { to: "/monitor", label: "Live monitor", icon: "terminal" },
    ],
  },
  {
    label: "Findings",
    items: [
      { to: "/explorer", label: "Error explorer", icon: "search", badge: 7 },
      { to: "/fixer", label: "Code fixer", icon: "wrench" },
      { to: "/regression", label: "Regression", icon: "trend" },
    ],
  },
  {
    label: "Project",
    items: [
      { to: "/github", label: "GitHub", icon: "github" },
      { to: "/history", label: "History & trends", icon: "history" },
      { to: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const bugs = [
  { id: "BUG-1042", severity: "crit", title: "API 500 on /api/cart/sync", page: "/cart", source: "runtime", status: "med", statusLabel: "Patch drafted", detected: "9m ago" },
  { id: "BUG-1041", severity: "crit", title: "Cannot read 'total' of undefined", page: "/checkout", source: "runtime", status: "crit", statusLabel: "Unresolved", detected: "12m ago" },
  { id: "BUG-1040", severity: "high", title: "Hardcoded secret in config.js", page: "—", source: "static · npm audit", status: "crit", statusLabel: "Unresolved", detected: "12m ago" },
  { id: "BUG-1039", severity: "med", title: "Broken image link, 6 occurrences", page: "/products/*", source: "runtime", status: "med", statusLabel: "Patch drafted", detected: "14m ago" },
  { id: "BUG-1035", severity: "med", title: 'Form label missing for="" on email field', page: "/signup", source: "runtime", status: "pass", statusLabel: "Verified", detected: "1h ago" },
  { id: "BUG-1030", severity: "low", title: "Unused eslint-disable directive", page: "—", source: "static · eslint", status: "low", statusLabel: "Ignored", detected: "1h ago" },
  { id: "BUG-1028", severity: "low", title: "Console warning: key prop missing", page: "/orders", source: "runtime", status: "pass", statusLabel: "Verified", detected: "2h ago" },
];

export const pipeline = [
  { name: "Explorer", status: "done", detail: "18 found" },
  { name: "Localizer", status: "done", detail: "15 mapped" },
  { name: "Patcher", status: "running", detail: "drafting fix" },
  { name: "Verifier", status: "pending", detail: "queued" },
];

export const runs = [
  { id: "#142", trigger: "push to main", found: 18, fixed: 2, duration: "2m 41s", status: "pass", statusLabel: "Completed" },
  { id: "#141", trigger: "manual", found: 21, fixed: 6, duration: "3m 02s", status: "pass", statusLabel: "Completed" },
  { id: "#140", trigger: "pull request #217", found: 9, fixed: 4, duration: "1m 54s", status: "pass", statusLabel: "Completed" },
  { id: "#139", trigger: "push to main", found: "—", fixed: "—", duration: "0m 12s", status: "crit", statusLabel: "Sandbox build failed" },
];

export const terminalLines = [
  { time: "14:02:11", agent: "explorer", msg: "navigating to /checkout", tone: "muted" },
  { time: "14:02:12", agent: "explorer", msg: "console error: Cannot read properties of undefined (reading 'total')", tone: "err" },
  { time: "14:02:13", agent: "explorer", msg: "screenshot captured · DOM snapshot saved", tone: "muted" },
  { time: "14:02:19", agent: "explorer", msg: "crawl complete — 18 issues logged to MongoDB", tone: "ok" },
  { time: "14:02:20", agent: "localizer", msg: "resolving sourcemap for bundle.a92f.js", tone: "muted" },
  { time: "14:02:21", agent: "localizer", msg: "mapped → src/components/CheckoutSummary.tsx:47", tone: "ok" },
  { time: "14:02:22", agent: "localizer", msg: "running eslint on affected file", tone: "muted" },
  { time: "14:02:23", agent: "localizer", msg: "npm audit — 1 moderate advisory found", tone: "muted" },
  { time: "14:02:24", agent: "localizer", msg: "mapping bug 7/18…", tone: "muted" },
];
