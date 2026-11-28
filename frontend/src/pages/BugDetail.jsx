import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_URL, fetchScans } from "@/lib/api";

export default function BugDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans()
      .then((scans) => {
        for (const s of scans) {
          const bug = (s.bugs || []).find((b) => b.id === id);
          if (bug) {
            const patch = (s.patches || []).find((p) => p.bugId === id);
            const verdict = (s.verifications || []).find((v) => v.bugId === id);
            setEntry({ scan: s, bug, patch, verdict });
            break;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-[13px] text-text-dim">Loading bug details...</div>;
  if (!entry) return <div className="text-[13px] text-text-dim">Bug not found. Go back to Error explorer.</div>;

  const { scan, bug, patch, verdict } = entry;
  const sevVariant = { critical: "crit", high: "high", medium: "med", low: "low" }[bug.severity] || "med";

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-mono text-[11px] text-text-dim">{bug.id}</span>
          <h2 className="font-display text-[19px] font-semibold mt-0.5">{bug.description}</h2>
          <p className="mt-1">
            <Badge variant={sevVariant} className="mr-1.5">
              {bug.severity}
            </Badge>
            Detected on <span className="font-mono">{bug.pageUrl}</span>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            Download PDF
          </Button>
          <Button size="sm" onClick={() => navigate("/fixer")}>
            View in Fixer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Screenshot at time of failure</CardTitle>
            {bug.screenshotPath ? (
              <img
                src={bug.screenshotPath.startsWith("data:") ? bug.screenshotPath : `${API_URL}${bug.screenshotPath}`}
                alt={`Screenshot for ${bug.pageUrl}`}
                className="w-full rounded-md border border-hairline object-cover max-h-[240px]"
              />
            ) : (
              <div className="h-[140px] rounded-md flex items-center justify-center text-text-dim text-[12px] bg-panel-raised">
                No screenshot captured for this scan.
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>AI fault localization findings</CardTitle>
            {bug.staticFindings?.length ? (
              <ul className="text-[13px] text-text-muted leading-relaxed list-disc pl-4 space-y-1">
                {bug.staticFindings.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-text-dim">No additional static findings recorded.</p>
            )}
          </Card>

          <Card>
            <CardTitle>DOM snapshot (sanitized)</CardTitle>
            {bug.domSnapshot ? (
              <pre className="font-mono text-[11px] text-text-dim whitespace-pre-wrap max-h-[220px] overflow-y-auto bg-[#0A0C0F] p-3 rounded-md">
                {bug.domSnapshot}
              </pre>
            ) : (
              <div className="text-[12px] text-text-dim">No DOM snapshot captured for this scan.</div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Location</CardTitle>
            <div className="font-mono text-[12.5px] text-signal">
              {bug.filePath ? `${bug.filePath}${bug.lineNumber ? `:${bug.lineNumber}` : ""}` : "Unmapped (no matching source file in repo)"}
            </div>
            <div className="text-[12px] text-text-dim mt-1.5">via Fault Localizer agent</div>
          </Card>

          <Card>
            <CardTitle>Suggested fix</CardTitle>
            {patch?.diff ? (
              <pre className="font-mono text-[12px] rounded-md overflow-x-auto bg-[#0A0C0F] p-3 text-text-muted whitespace-pre-wrap">
                {patch.diff}
              </pre>
            ) : (
              <div className="text-[12.5px] text-text-dim">No diff generated yet.</div>
            )}
          </Card>

          {verdict && (
            <Card>
              <CardTitle>Verifier verdict (attempt {verdict.attempt})</CardTitle>
              <p className="text-[13px] text-text-muted leading-relaxed">{verdict.reason}</p>
            </Card>
          )}

          <Card>
            <CardTitle>Status</CardTitle>
            <div className="flex flex-col gap-2.5">
              <StatusRow label="Localized" variant={bug.filePath ? "pass" : "med"} text={bug.filePath ? "Done" : "Unmapped"} />
              <StatusRow label="Patch drafted" variant={patch?.diff ? "pass" : "high"} text={patch?.diff ? "Done" : "Pending"} />
              <StatusRow
                label="Verified"
                variant={verdict?.passed ? "pass" : verdict ? "crit" : "high"}
                text={verdict ? (verdict.passed ? "Passed" : "Failed") : "Pending"}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatusRow({ label, variant, text }) {
  return (
    <div className="flex justify-between text-[12.5px]">
      <span>{label}</span>
      <Badge variant={variant}>{text}</Badge>
    </div>
  );
}