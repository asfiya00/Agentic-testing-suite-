import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Th, Td, Tr } from "@/components/ui/table";
import { fetchScans, socket } from "@/lib/api";

const filters = ["All", "Runtime", "Static", "Unmapped"];

function mapSeverity(sev) {
  return { critical: "crit", high: "high", medium: "med", low: "low" }[sev] || "med";
}

function mapStatusVariant(status) {
  if (status === "verified") return "pass";
  if (status === "failed") return "crit";
  if (status === "patched" || status === "localized") return "med";
  return "high";
}

export default function Explorer() {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const load = () => {
    fetchScans()
      .then((scans) => {
        const all = scans.flatMap((s) =>
          (s.bugs || []).map((b) => ({
            ...b,
            scanId: s._id,
            detectedAt: s.createdAt ? new Date(s.createdAt).toLocaleTimeString() : "—",
          }))
        );
        setBugs(all);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    socket.on("scan:updated", load);
    return () => socket.off("scan:updated", load);
  }, []);

  const filtered = bugs.filter((b) => {
    if (activeFilter === "Runtime") return b.detectionSource === "runtime";
    if (activeFilter === "Static") return b.detectionSource === "static";
    if (activeFilter === "Unmapped") return !b.filePath;
    return true;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-[19px] font-semibold">Error explorer</h2>
          <p className="text-[12.5px] text-text-dim mt-0.5">{filtered.length} finding(s) across your scans</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <Badge
            key={f}
            variant={activeFilter === f ? "crit" : "low"}
            className="cursor-pointer"
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      <Card className="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Severity</Th>
              <Th>Bug</Th>
              <Th>Page</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Detected</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center text-text-dim py-8">
                  No findings match this filter yet.
                </Td>
              </Tr>
            ) : (
              filtered.map((b) => (
                <Tr key={`${b.scanId}-${b.id}`} onClick={() => navigate(`/explorer/${b.id}`)}>
                  <Td>
                    <Badge variant={mapSeverity(b.severity)}>{labelFor(mapSeverity(b.severity))}</Badge>
                  </Td>
                  <Td>{b.description}</Td>
                  <Td className="font-mono text-text-muted">{b.pageUrl}</Td>
                  <Td className="font-mono text-text-muted">{b.detectionSource}</Td>
                  <Td>
                    <Badge variant={mapStatusVariant(b.status)}>{b.status}</Badge>
                  </Td>
                  <Td className="font-mono text-text-muted">{b.detectedAt}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

function labelFor(sev) {
  return { crit: "Critical", high: "High", med: "Medium", low: "Low" }[sev] ?? sev;
}