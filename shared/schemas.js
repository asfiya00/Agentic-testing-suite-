import { z } from "zod";

// 1. Input to Orchestrator
export const ScanRequestSchema = z.object({
  repoUrl: z.string().url(),
  liveUrl: z.string().url().optional(),
  maxPages: z.number().int().positive().default(10),
});

// 2. Output from Explorer Agent
export const BugObjectSchema = z.object({
  id: z.string(),
  type: z.enum(["console_error", "network_error", "broken_link", "ui_issue", "static_analysis"]),
  pageUrl: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detectionSource: z.enum(["runtime", "static"]),
  screenshotPath: z.string().optional(),
  domSnapshot: z.string().optional(),
  status: z.enum(["open", "localized", "patched", "verified", "failed"]).default("open"),
});

// 3. Output from Fault Localizer Agent
export const LocalizedBugSchema = BugObjectSchema.extend({
  filePath: z.string().nullable(),
  lineNumber: z.number().int().nullable(),
  staticFindings: z.array(z.string()).default([]),
});

// 4. Output from Patcher Agent
export const PatchResultSchema = z.object({
  bugId: z.string(),
  diff: z.string(),
  branchName: z.string(),
  prUrl: z.string().nullable(),
});

// 5. Output from Verifier Agent
export const VerificationResultSchema = z.object({
  bugId: z.string(),
  passed: z.boolean(),
  reason: z.string(),
  attempt: z.number().int().min(1).max(3),
});