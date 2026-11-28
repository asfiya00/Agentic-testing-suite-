import { askLLM } from "../../shared/llm.js";
import { PatchResultSchema } from "../../shared/schemas.js";
import { pathToFileURL } from "url";

// Fetch raw file content from a public GitHub repo
async function fetchFileContent(repoUrl, filePath) {
  if (!filePath) return null;
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/)?$/);
    if (!match) return null;
    const [, owner, repo] = match;

    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filePath}`);
    if (!res.ok) return null;
    return (await res.text()).slice(0, 6000);
  } catch {
    return null;
  }
}

export async function runPatcher(localizedBug, repoUrl, previousFeedback = "") {
  const fileContent = await fetchFileContent(repoUrl, localizedBug.filePath);

  const prompt = `
You are a Patcher agent. Generate a minimal, safe code fix as a unified diff for the bug below.
Return ONLY valid JSON with this exact key:
{
  "diff": string
}

Bug:
- ID: ${localizedBug.id}
- Type: ${localizedBug.type}
- Page: ${localizedBug.pageUrl}
- File: ${localizedBug.filePath || "unknown"}
- Line: ${localizedBug.lineNumber || "unknown"}
- Description: ${localizedBug.description}
${previousFeedback ? `\nPrevious verification failed with:\n${previousFeedback}\nPlease fix that issue in your new diff.` : ""}

Source file content:
${fileContent || "(Source file unavailable; provide a best-effort illustrative patch)"}
`;

  const raw = await askLLM(prompt, { json: true });
  const parsed = JSON.parse(raw);

  return PatchResultSchema.parse({
    bugId: localizedBug.id,
    diff: parsed.diff || "",
    branchName: `ai-fix/${localizedBug.id.slice(0, 8)}`,
    prUrl: null, // Will be populated when GitHub OAuth / Octokit PR creation is added
  });
}

// Quick terminal test
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sampleLocalizedBug = {
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
  const patch = await runPatcher(sampleLocalizedBug, "https://github.com/example/demo-app");
  console.log(JSON.stringify(patch, null, 2));
}