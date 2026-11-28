import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { fetchScans, socket } from "@/lib/api";

const retryDot = {
  fail: "border-crit text-crit bg-crit-dim",
  pass: "border-pass text-pass bg-pass-dim",
  pending: "border-hairline text-text-dim",
};

export default function Fixer() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    fetchScans()
      .then((scans) => {
        const list = scans.flatMap((s) =>
          (s.patches || []).map((p) => {
            const bug = (s.bugs || []).find((b) => b.id === p.bugId);
            const verdict = (s.verifications || []).find((v) => v.bugId === p.bugId);
            return { scanId: s._id, patch: p, bug, verdict };
          })
        );
        setItems(list);
        if (list.length > 0 && !selectedId) setSelectedId(list[0].patch.bugId);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    socket.on("scan:updated", load);
    return () => socket.off("scan:updated", load);
  }, []);

  const verified = items.filter((i) => i.verdict?.passed);
  const failed = items.filter((i) => i.verdict && !i.verdict.passed);
  const open = items.filter((i) => !i.verdict);

  const filtered = tab === 1 ? verified : tab === 2 ? failed : items;
  const activeItem = filtered.find((i) => i.patch.bugId === selectedId) || filtered[0];

  return (
    <>
      <div className="mb-4">
        <h2 className="font-display text-[19px] font-semibold">Code fixer</h2>
        <p className="text-[12.5px] text-text-dim mt-0.5">
          Generated patches, pull requests, and verification outcomes
        </p>
      </div>

      <Tabs
        tabs={[`All (${items.length})`, `Verified (${verified.length})`, `Failed (${failed.length})`]}
        active={tab}
        onChange={setTab}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3.5">
          {filtered.length === 0 ? (
            <Card>
              <div className="text-[13px] text-text-dim">No patches in this category yet.</div>
            </Card>
          ) : (
            filtered.map((item) => {
              const { patch, bug, verdict } = item;
              const badgeVariant = verdict?.passed ? "pass" : verdict ? "crit" : "high";
              const badgeText = verdict?.passed ? "Verified" : verdict ? "Failed" : `Open (${open.length})`;
              return (
                <Card
                  key={`${item.scanId}-${patch.bugId}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(patch.bugId)}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="font-semibold text-[13.5px]">{bug?.description || patch.bugId}</div>
                      <div className="font-mono text-[11px] text-text-dim">
                        {patch.bugId.slice(0, 8)} · {bug?.filePath || "unmapped"}
                      </div>
                    </div>
                    <Badge variant={badgeVariant}>{badgeText}</Badge>
                  </div>
                  <div className="font-mono text-[12px] border border-hairline rounded-md overflow-hidden">
                    <div className="flex justify-between px-3.5 py-2 bg-panel-raised border-b border-hairline text-text-muted">
                      <span>{patch.branchName}</span>
                      {patch.prUrl ? (
                        <a href={patch.prUrl} target="_blank" rel="noreferrer" className="text-signal">
                          View PR →
                        </a>
                      ) : (
                        <span className="text-text-dim">Local diff</span>
                      )}
                    </div>
                    <pre className="p-3 bg-[#0A0C0F] text-text-muted overflow-x-auto whitespace-pre-wrap">
                      {patch.diff || "(empty diff)"}
                    </pre>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card>
          <CardTitle>
            Verification history {activeItem ? `— ${activeItem.patch.bugId.slice(0, 8)}` : ""}
          </CardTitle>
          {!activeItem ? (
            <div className="text-[12.5px] text-text-dim">Select a patch to view verification details.</div>
          ) : (
            <div className="flex flex-col gap-3.5 mt-1.5">
              <div className="flex gap-3">
                <div
                  className={`w-[26px] h-[26px] rounded-full border flex items-center justify-center font-mono text-[10px] flex-shrink-0 ${
                    activeItem.verdict?.passed
                      ? retryDot.pass
                      : activeItem.verdict
                        ? retryDot.fail
                        : retryDot.pending
                  }`}
                >
                  {activeItem.verdict?.attempt || 1}
                </div>
                <div>
                  <div className="text-[12.5px] font-medium">
                    {activeItem.verdict
                      ? activeItem.verdict.passed
                        ? `Attempt ${activeItem.verdict.attempt} — passed`
                        : `Attempt ${activeItem.verdict.attempt} — failed`
                      : "Pending verification"}
                  </div>
                  <div className="text-[11.5px] text-text-dim">
                    {activeItem.verdict?.reason || "Waiting for Verifier agent"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}