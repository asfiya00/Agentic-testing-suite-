import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Th, Td, Tr } from "@/components/ui/table";
import { fetchScans, socket } from "@/lib/api";

export default function History() {
  const [scans, setScans] = useState([]);

  const load = () => {
    fetchScans().then(setScans).catch(() => {});
  };

  useEffect(() => {
    load();
    socket.on("scan:updated", load);
    return () => socket.off("scan:updated", load);
  }, []);

  return (
    <>
      <div className="mb-4">
        <h2 className="font-display text-[19px] font-semibold">History &amp; trends</h2>
        <p className="text-[12.5px] text-text-dim mt-0.5">{scans.length} scan(s) recorded</p>
      </div>

      <Card className="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Run</Th>
              <Th>Target URL</Th>
              <Th>Bugs found</Th>
              <Th>Auto-fixed</Th>
              <Th>Created</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {scans.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center text-text-dim py-8">
                  No scans recorded yet.
                </Td>
              </Tr>
            ) : (
              scans.map((s) => {
                const fixedCount = (s.verifications || []).filter((v) => v.passed).length;
                const badgeVariant = s.status === "completed" ? "pass" : s.status === "failed" ? "crit" : "med";
                const statusLabel = s.status.charAt(0).toUpperCase() + s.status.slice(1);
                return (
                  <Tr key={s._id} hover={false}>
                    <Td className="font-mono">#{s._id.slice(-6)}</Td>
                    <Td className="font-mono text-text-muted">{s.liveUrl || s.repoUrl}</Td>
                    <Td>{s.bugs?.length ?? 0}</Td>
                    <Td>{fixedCount}</Td>
                    <Td className="font-mono text-text-muted">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                    </Td>
                    <Td>
                      <Badge variant={badgeVariant}>{statusLabel}</Badge>
                    </Td>
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}