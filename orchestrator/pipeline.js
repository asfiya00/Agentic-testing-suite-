import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { runExplorer } from "../agents/explorer/crawler.js";
import { runFaultLocalizer } from "../agents/fault-localizer/localizer.js";
import { runPatcher } from "../agents/patcher/patcher.js";
import { runVerifier } from "../agents/verifier/verifier.js";

const MAX_RETRIES = 2;

// Shared structured state passed between agents
const PipelineState = Annotation.Root({
  repoUrl: Annotation(),
  liveUrl: Annotation(),
  maxPages: Annotation(),
  scanId: Annotation(),
  onLog: Annotation(),
  scannedPages: Annotation({ reducer: (_, next) => next, default: () => [] }),
  bugs: Annotation({ reducer: (_, next) => next, default: () => [] }),
  patches: Annotation({ reducer: (_, next) => next, default: () => [] }),
  verifications: Annotation({ reducer: (_, next) => next, default: () => [] }),
  retryCount: Annotation({ reducer: (_, next) => next, default: () => 0 }),
});

function log(state, agent, message) {
  if (typeof state.onLog === "function") state.onLog({ agent, message });
}

// Node 1: Explorer
async function explorerNode(state) {
  log(state, "Explorer", `Crawling ${state.liveUrl}...`);
  const result = await runExplorer(state.liveUrl, state.maxPages || 3, state.scanId || "default");
  log(state, "Explorer", `Found ${result.bugs.length} bug(s) across ${result.scannedPages.length} page(s).`);
  return { scannedPages: result.scannedPages, bugs: result.bugs };
}

// Node 2: Fault Localizer
async function localizerNode(state) {
  if (!state.bugs.length) return {};
  log(state, "Fault Localizer", `Mapping ${state.bugs.length} bug(s) to source files...`);
  const localized = [];
  for (const bug of state.bugs) {
    localized.push(await runFaultLocalizer(bug, state.repoUrl));
  }
  log(state, "Fault Localizer", "Localization complete.");
  return { bugs: localized };
}

// Node 3: Patcher
async function patcherNode(state) {
  if (!state.bugs.length) return {};
  const attempt = state.retryCount + 1;
  log(state, "Patcher", `Generating patches (attempt ${attempt}/${MAX_RETRIES})...`);
  const patches = [];
  for (const bug of state.bugs) {
    const prevFail = state.verifications.find((v) => v.bugId === bug.id && !v.passed);
    patches.push(await runPatcher(bug, state.repoUrl, prevFail?.reason || ""));
  }
  return { patches };
}

// Node 4: Verifier
async function verifierNode(state) {
  if (!state.patches.length) return {};
  const attempt = state.retryCount + 1;
  log(state, "Verifier", `Verifying ${state.patches.length} patch(es)...`);
  const verifications = [];
  for (const patch of state.patches) {
    const bug = state.bugs.find((b) => b.id === patch.bugId);
    if (bug) {
      const verdict = await runVerifier(bug, patch, attempt);
      bug.status = verdict.passed ? "verified" : "failed";
      verifications.push(verdict);
    }
  }
  return { verifications, bugs: [...state.bugs], retryCount: attempt };
}

// Conditional edge: retry Patcher if any verification failed and attempts < MAX_RETRIES
function shouldRetry(state) {
  const anyFailed = state.verifications.some((v) => !v.passed);
  if (anyFailed && state.retryCount < MAX_RETRIES) {
    return "patcher";
  }
  return END;
}

const graph = new StateGraph(PipelineState)
  .addNode("explorer", explorerNode)
  .addNode("localizer", localizerNode)
  .addNode("patcher", patcherNode)
  .addNode("verifier", verifierNode)
  .addEdge(START, "explorer")
  .addConditionalEdges("explorer", (s) => (s.bugs.length > 0 ? "localizer" : END))
  .addEdge("localizer", "patcher")
  .addEdge("patcher", "verifier")
  .addConditionalEdges("verifier", shouldRetry)
  .compile();

export async function runPipeline({ repoUrl, liveUrl, maxPages = 3, scanId = "default", onLog }) {
  return await graph.invoke({ repoUrl, liveUrl, maxPages, scanId, onLog });
}