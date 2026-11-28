import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PipelineRail } from "@/components/PipelineRail";
import { socket, fetchScanById, fetchScans } from "@/lib/api";

const agentColor = {
  explorer: "text-signal",
  localizer: "text-[#C084FC]",
  patcher: "text-warn",
  verifier: "text-pass",
  orchestrator: "text-text-muted",
};

const toneColor = {
  ok: "text-pass",
  err: "text-crit",
  muted: "text-text-muted",
};

function normalizeAgent(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("explorer")) return "explorer";
  if (lower.includes("localizer")) return "localizer";
  if (lower.includes("patcher")) return "patcher";
  if (lower.includes("verifier")) return "verifier";
  return "orchestrator";
}

function formatTime() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export default function Monitor() {
  const location = useLocation();
  const initialScanId = location.state?.scanId || null;

  const [scanId, setScanId] = useState(initialScanId);
  const [scan, setScan] = useState(null);
  const [lines, setLines] = useState([]);
  const [activeAgent, setActiveAgent] = useState("explorer");

  useEffect(() => {
    async function loadLatest() {
      if (initialScanId) {
        const s = await fetchScanById(initialScanId).catch(() => null);
        if (s) setScan(s);
      } else {
        const all = await fetchScans().catch(() => []);
        if (all.length > 0) {
          setScan(all[0]);
          setScanId(all[0]._id);
        }
      }
    }
    loadLatest();
  }, [initialScanId]);

  useEffect(() => {
    function onLog(entry) {
      if (scanId && entry.scanId && entry.scanId !== scanId) return;
      const agentKey = normalizeAgent(entry.agent);
      setActiveAgent(agentKey);

      const lowerMsg = (entry.message || "").toLowerCase();
      const tone = lowerMsg.includes("fail") || lowerMsg.includes("error")
        ? "err"
        : lowerMsg.includes("complete") || lowerMsg.includes("found")
          ? "ok"
          : "muted";

      setLines((prev) => [
        ...prev,
        { time: formatTime(), agent: agentKey, msg: entry.message, tone },
      ]);
    }

    function onUpdated(updatedScan) {
      if (!scanId || updatedScan._id === scanId) {
        setScan(updatedScan);
      }
    }

    socket.on("agent:log", onLog);
    socket.on("scan:updated", onUpdated);
    return () => {
      socket.off("agent:log", onLog);
      socket.off("scan:updated", onUpdated);
    };
  }, [scanId]);

  const isDone = scan?.status === "completed";
  const isFailed = scan?.status === "failed";
  const order = ["explorer", "localizer", "patcher", "verifier"];
  const activeIdx = order.indexOf(activeAgent);

  const monitorNodes = order.map((key, idx) => {
    const label = key === "localizer" ? "Localizer" : key.charAt(0).toUpperCase() + key.slice(1);
    let status = "pending";
    let detail = "queued";
    if (isDone) {
      status = "done";
      detail = "done";
    } else if (isFailed && idx === activeIdx) {
      status = "failed";
      detail = "failed";
    } else if (idx < activeIdx) {
      status = "done";
      detail = "done";
    } else if (idx === activeIdx && lines.length > 0) {
      status = "running";
      detail = "running";
    }
    return { name: label, status, detail };
  });

  return (
    <>
      <PipelineRail nodes={monitorNodes} title={null} />

      <div className="bg-[#0A0C0F] border border-hairline rounded-lg font-mono text-[12px] overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-hairline">
          <span className="w-2.5 h-2.5 rounded-full bg-crit" />
          <span className="w-2.5 h-2.5 rounded-full bg-warn" />
          <span className="w-2.5 h-2.5 rounded-full bg-pass" />
          <span className="text-text-dim ml-1.5">
            {scanId ? `scan ${scanId.slice(-6)} · ${scan?.status || "running"} · streamed via Socket.io` : "live · waiting for scan"}
          </span>
        </div>
        <div className="p-3.5 h-[340px] overflow-y-auto leading-loose">
          {lines.length === 0 ? (
            <div className="text-text-dim">
              {isDone
                ? `Scan completed: ${scan.bugs?.length || 0} bug(s) found, ${scan.patches?.length || 0} patch(es) drafted.`
                : "Waiting for agent logs... Launch a scan from /launcher to see live activity."}
            </div>
          ) : (
            lines.map((l, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-text-dim flex-shrink-0">{l.time}</span>
                <span className={`flex-shrink-0 w-[110px] font-semibold ${agentColor[l.agent]}`}>{l.agent}</span>
                <span className={toneColor[l.tone]}>{l.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}