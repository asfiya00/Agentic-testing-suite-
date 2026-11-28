import { askLLM } from "../../shared/llm.js";
import { LocalizedBugSchema } from "../../shared/schemas.js";
import { pathToFileURL } from "url";

// Fetch the list of file paths from a public GitHub repository
async function getRepoFiles(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/)?$/);
    if (!match) return [];
    const [, owner, repo] = match;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
      headers: { "User-Agent": "ai-qa-suite" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    return (data.tree || [])
      .filter((item) => item.type === "blob")
      .map((item) => item.path)
      .slice(0, 150);
  } catch {
    return [];
  }
}

export async function runFaultLocalizer(bug, repoUrl) {
  const files = await getRepoFiles(repoUrl);

  const prompt = `
You are a Fault Localizer agent. Given a runtime bug and the repository's file list, identify the most likely source file and line number.
Return ONLY valid JSON with these exact keys:
{
  "filePath": string or null,
  "lineNumber": number or null,
  "staticFindings": string[]
}

Bug:
- Type: ${bug.type}
- Page URL: ${bug.pageUrl}
- Description: ${bug.description}

Repository files:
${files.length ? files.join("\n") : "(Could not fetch repo file list)"}
`;

  const raw = await askLLM(prompt, { json: true });
  const parsed = JSON.parse(raw);

  return LocalizedBugSchema.parse({
    ...bug,
    status: "localized",
    filePath: parsed.filePath ?? null,
    lineNumber: typeof parsed.lineNumber === "number" ? parsed.lineNumber : null,
    staticFindings: Array.isArray(parsed.staticFindings) ? parsed.staticFindings : [],
  });
}

// Quick terminal test
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sampleBug = {
    id: "test-1",
    type: "console_error",
    pageUrl: "https://example.com/login",
    description: "TypeError: Cannot read properties of undefined (reading 'token')",
    severity: "high",
    detectionSource: "runtime",
  };
  const result = await runFaultLocalizer(sampleBug, "https://github.com/vercel/next.js");
  console.log(JSON.stringify(result, null, 2));
}