import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineRail } from "@/components/PipelineRail";
import { fetchScans, socket } from "@/lib/api";

export default function Dashboard() {
  const [scans, setScans] = useState([]);

  const load = () => {
    fetchScans().then(setScans).catch(() => {});
  };

  useEffect(() => {
    load();
    socket.on("scan:updated", load);
    return () => socket.off("scan:updated", load);
  }, []);

  const latest = scans[0];
  const allBugs = scans.flatMap((s) => s.bugs || []);
  const openBugs = allBugs.filter((b) => b.status !== "verified").length;
  const criticalCount = allBugs.filter((b) => b.severity === "critical" || b.severity === "high").length;
  const verifiedCount = allBugs.filter((b) => b.status === "verified").length;

  const statusVariant = latest?.status === "completed" ? "pass" : latest?.status === "failed" ? "crit" : "med";
  const statusLabel = latest ? latest.status.charAt(0).toUpperCase() + latest.status.slice(1) : "No scans yet";

  const pipelineNodes = [
    { name: "Explorer", status: latest ? "done" : "pending", detail: latest ? `${latest.bugs?.length || 0} found` : "idle" },
    { name: "Localizer", status: latest?.bugs?.length ? "done" : "pending", detail: latest ? `${latest.bugs?.filter((b) => b.filePath).length || 0} mapped` : "idle" },
    { name: "Patcher", status: latest?.patches?.length ? "done" : "pending", detail: latest ? `${latest.patches?.length || 0} drafted` : "idle" },
    { name: "Verifier", status: latest?.verifications?.length ? "done" : "pending", detail: latest ? `${latest.verifications?.filter((v) => v.passed).length || 0} passed` : "idle" },
  ];

  const bars = scans
    .slice(0, 8)
    .reverse()
    .map((s, idx) => {
      const count = s.bugs?.length || 0;
      return {
        h: Math.max(16, Math.min(130, count * 25 + 16)),
        color: count > 2 ? "var(--color-crit)" : count > 0 ? "var(--color-warn)" : "var(--color-pass)",
        label: `R${idx + 1}`,
      };
    });

  const activity = allBugs.slice(0, 5).map((b) => ({
    tag: b.status === "verified" ? "pass" : b.severity === "high" || b.severity === "critical" ? "crit" : "med",
    label: b.status === "verified" ? "Fixed" : b.status === "patched" ? "Patched" : "Found",
    text: b.description,
    time: b.pageUrl,
  }));

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <Card>
          <CardTitle>Open bugs</CardTitle>
          <div className="font-display text-[30px] font-semibold leading-none">{openBugs}</div>
          <div className="font-mono text-[11px] mt-2 text-text-dim">across {scans.length} scan(s)</div>
        </Card>
        <Card>
          <CardTitle>High / Critical</CardTitle>
          <div className="font-display text-[30px] font-semibold leading-none text-crit">{criticalCount}</div>
          <div className="font-mono text-[11px] mt-2 text-text-dim">total detected</div>
        </Card>
        <Card>
          <CardTitle>Auto-fixed &amp; verified</CardTitle>
          <div className="font-display text-[30px] font-semibold leading-none text-pass">{verifiedCount}</div>
          <div className="font-mono text-[11px] mt-2 text-pass">verified by Verifier</div>
        </Card>
        <Card>
          <CardTitle>Last scan status</CardTitle>
          <Badge variant={statusVariant} dot className="mt-1.5">
            {statusLabel}
          </Badge>
          <div className="font-mono text-[11px] mt-2 text-text-dim">
            {latest ? latest.liveUrl : "Run a scan in /launcher"}
          </div>
        </Card>
      </div>

      <PipelineRail nodes={pipelineNodes} />

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Card>
          <CardTitle>Bugs found — last {bars.length || 0} runs</CardTitle>
          <div className="flex items-end gap-3.5 h-[150px] pt-2.5">
            {bars.length === 0 ? (
              <div className="text-[12px] text-text-dim">No scan runs yet.</div>
            ) : (
              bars.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-5.5 rounded-[3px]"
                    style={{ height: b.h, background: b.color, width: 22 }}
                  />
                  <span className="font-mono text-[10px] text-text-dim">{b.label}</span>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardTitle>Recent activity</CardTitle>
          <div className="flex flex-col gap-3.5 mt-1">
            {activity.length === 0 ? (
              <div className="text-[12px] text-text-dim">No bugs logged yet.</div>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <Badge variant={a.tag} className="h-fit">
                    {a.label}
                  </Badge>
                  <div>
                    <div className="text-[12.5px]">{a.text}</div>
                    <div className="font-mono text-[10.5px] text-text-dim truncate max-w-[200px]">{a.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}