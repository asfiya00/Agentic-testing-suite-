import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SwitchRow } from "@/components/ui/switch";
import { startScan } from "@/lib/api";

const steps = [
  { n: "01", color: "text-signal", title: "Explorer crawls the app", body: "Checks links, console errors, network responses and visual issues in a real browser." },
  { n: "02", color: "text-[#C084FC]", title: "Fault localizer maps each bug", body: "Traces every finding to a file and line in your repo, plus static analysis." },
  { n: "03", color: "text-warn", title: "Patcher drafts a fix", body: "Generates a diff and opens a draft PR for review." },
  { n: "04", color: "text-pass", title: "Verifier confirms it", body: "Re-runs the original check against the patch, retrying up to 3 times." },
];

export default function Launcher() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("https://github.com/example/demo-app");
  const [liveUrl, setLiveUrl] = useState("https://example.com/broken-page");
  const [scope, setScope] = useState("full");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLaunch() {
    setError("");
    if (!liveUrl.trim()) {
      setError("Please enter a Live URL for now (Docker sandbox for repo-only scans comes later).");
      return;
    }

    const maxPages = scope === "single" ? 1 : scope === "prefix" ? 3 : 5;
    setLoading(true);
    try {
      const scan = await startScan({ repoUrl: repoUrl.trim(), liveUrl: liveUrl.trim(), maxPages });
      navigate("/monitor", { state: { scanId: scan._id } });
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : "Could not start scan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardTitle>Start a new scan</CardTitle>

        <div className="mb-4">
          <label className="block text-[12.5px] font-medium mb-1.5 text-text-muted">
            GitHub repository URL
          </label>
          <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo" />
          <div className="text-[11.5px] text-text-dim mt-1.5">
            Public repo, or private via the GitHub connection in Settings.
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[12.5px] font-medium mb-1.5 text-text-muted">
            Live URL <span className="text-text-dim font-normal">(optional)</span>
          </label>
          <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://staging.acme.com" />
          <div className="text-[11.5px] text-text-dim mt-1.5">
            Without this, Sentinel builds and runs the repo in an isolated Docker sandbox before crawling it.
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[12.5px] font-medium mb-1.5 text-text-muted">Crawl scope</label>
          <Select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="full">Full site — follow all internal links</option>
            <option value="single">Single page only</option>
            <option value="prefix">Path prefix: /checkout/*</option>
          </Select>
        </div>

        <SwitchRow label="Respect robots.txt" defaultChecked />
        <SwitchRow
          label="Block destructive actions"
          desc="No real payment submissions or delete calls"
          defaultChecked
        />
        <SwitchRow label="Auto-open PRs for high-confidence fixes" />

        {error && <div className="text-[12px] text-crit mt-3">{error}</div>}

        <Button onClick={handleLaunch} disabled={loading} className="w-full justify-center mt-4.5">
          {loading ? "Launching..." : "Launch scan"}
        </Button>
      </Card>

      <Card>
        <CardTitle>What happens next</CardTitle>
        <div className="flex flex-col gap-4 mt-1">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-3">
              <div className={`font-mono ${s.color}`}>{s.n}</div>
              <div>
                <div className="text-[13px] font-medium">{s.title}</div>
                <div className="text-[12px] text-text-dim">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}