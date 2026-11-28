import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td, Tr } from "@/components/ui/table";
import { fetchScans } from "@/lib/api";

function bugKey(b) {
  return `${b.type}::${b.pageUrl}::${b.description}`;
}

function mapSeverity(sev) {
  return { critical: "crit", high: "high", medium: "med", low: "low" }[sev] || "med";
}

export default function Regression() {
  const [scans, setScans] = useState([]);
  const [pairIdx, setPairIdx] = useState(0);

  useEffect(() => {
    fetchScans()
      .then((all) => setScans(all.filter((s) => s.status === "completed")))
      .catch(() => {});
  }, []);

  const pairs = [];
  for (let i = 0; i < scans.length - 1; i++) {
    pairs.push({ current: scans[i], prev: scans[i + 1] });
  }

  const active = pairs[pairIdx];
  const currBugs = active?.current?.bugs || [];
  const prevBugs = active?.prev?.bugs || [];

  const prevKeys = new Set(prevBugs.map(bugKey));
  const currKeys = new Set(currBugs.map(bugKey));

  const newBugs = currBugs.filter((b) => !prevKeys.has(bugKey(b)));
  const recurringBugs = currBugs.filter((b) => prevKeys.has(bugKey(b)));
  const resolvedBugs = prevBugs.filter((b) => !currKeys.has(bugKey(b)));

  const changes = [
    ...newBugs.map((b) => ({ change: "crit", changeLabel: "New", bug: b })),
    ...resolvedBugs.map((b) => ({ change: "pass", changeLabel: "Resolved", bug: b })),
    ...recurringBugs.map((b) => ({ change: "high", changeLabel: "Recurring", bug: b })),
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-[19px] font-semibold">Regression view</h2>
          <p className="text-[12.5px] text-text-dim mt-0.5">
            {active
              ? `Comparing #${active.current._id.slice(-6)} against #${active.prev._id.slice(-6)}`
              : "Need at least 2 completed scans to compare"}
          </p>
        </div>
        {pairs.length > 0 && (
          <Select value={pairIdx} onChange={(e) => setPairIdx(Number(e.target.value))} className="w-auto">
            {pairs.map((p, idx) => (
              <option key={p.current._id} value={idx}>
                #{p.current._id.slice(-6)} vs #{p.prev._id.slice(-6)}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardTitle>New this run</CardTitle>
          <div className="font-display text-[24px] font-semibold text-crit">{newBugs.length}</div>
        </Card>
        <Card>
          <CardTitle>Resolved this run</CardTitle>
          <div className="font-display text-[24px] font-semibold text-pass">{resolvedBugs.length}</div>
        </Card>
        <Card>
          <CardTitle>Still recurring</CardTitle>
          <div className="font-display text-[24px] font-semibold text-warn">{recurringBugs.length}</div>
        </Card>
      </div>

      <Card className="mt-4 p-0">
        <Table>
          <thead>
            <tr>
              <Th>Change</Th>
              <Th>Bug</Th>
              <Th>Severity</Th>
              <Th>Page</Th>
            </tr>
          </thead>
          <tbody>
            {changes.length === 0 ? (
              <Tr hover={false}>
                <Td colSpan={4} className="text-center text-text-dim py-8">
                  {active ? "No differences found between these runs." : "Run at least 2 completed scans to see regressions."}
                </Td>
              </Tr>
            ) : (
              changes.map((c, i) => (
                <Tr key={i} hover={false}>
                  <Td>
                    <Badge variant={c.change}>{c.changeLabel}</Badge>
                  </Td>
                  <Td>{c.bug.description}</Td>
                  <Td>
                    <Badge variant={mapSeverity(c.bug.severity)}>{c.bug.severity}</Badge>
                  </Td>
                  <Td className="font-mono text-text-muted">{c.bug.pageUrl}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}