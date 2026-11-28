import { askLLM } from "../../shared/llm.js";
import { VerificationResultSchema } from "../../shared/schemas.js";
import { pathToFileURL } from "url";

export async function runVerifier(localizedBug, patchResult, attempt = 1) {
  if (!patchResult.diff || !patchResult.diff.trim()) {
    return VerificationResultSchema.parse({
      bugId: localizedBug.id,
      passed: false,
      reason: "Patcher produced an empty diff.",
      attempt,
    });
  }

  const prompt = `
You are a Verifier agent. Review the proposed diff against the original bug and decide if the fix resolves the root cause without introducing obvious issues.
Return ONLY valid JSON with these exact keys:
{
  "passed": boolean,
  "reason": string
}

Original Bug:
- Type: ${localizedBug.type}
- Page: ${localizedBug.pageUrl}
- File: ${localizedBug.filePath || "unknown"}
- Description: ${localizedBug.description}

Proposed Diff:
${patchResult.diff}
`;

  const raw = await askLLM(prompt, { json: true });
  const parsed = JSON.parse(raw);

  return VerificationResultSchema.parse({
    bugId: localizedBug.id,
    passed: Boolean(parsed.passed),
    reason: parsed.reason || (parsed.passed ? "Patch verified." : "Patch did not resolve the issue."),
    attempt,
  });
}

// Quick terminal test
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sampleBug = {
    id: "test-1234",
    type: "console_error",
    pageUrl: "https://example.com/login",
    description: "TypeError: Cannot read properties of undefined (reading 'token')",
    severity: "high",
    detectionSource: "runtime",
    status: "localized",
    filePath: "src/auth.js",
    lineNumber: 12,
    staticFindings: [],
  };
  const samplePatch = {
    bugId: "test-1234",
    diff: "--- a/src/auth.js\n+++ b/src/auth.js\n@@ -9,7 +9,7 @@\n-  const token = response.token;\n+  const token = response?.token;\n",
    branchName: "ai-fix/test-123",
    prUrl: null,
  };
  const verdict = await runVerifier(sampleBug, samplePatch, 1);
  console.log(JSON.stringify(verdict, null, 2));
}