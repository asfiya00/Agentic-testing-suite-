import { chromium } from "playwright";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { BugObjectSchema } from "../../shared/schemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_ROOT = path.resolve(__dirname, "../../backend/uploads/screenshots");

// Capture a sanitized DOM snapshot (strips scripts and redacts form values/passwords)
async function captureSafeDom(page) {
  try {
    return await page.evaluate(() => {
      const clone = document.documentElement.cloneNode(true);
      clone.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
      clone.querySelectorAll("input, textarea, select").forEach((el) => {
        el.removeAttribute("value");
        if (el.tagName === "TEXTAREA") el.textContent = "[REDACTED]";
      });
      return clone.outerHTML.slice(0, 4000);
    });
  } catch {
    return undefined;
  }
}

// Capture a screenshot safely and return its public API path
async function captureScreenshot(page, scanId, pageIndex) {
  try {
    const safeScanId = String(scanId || "default").replace(/[^a-zA-Z0-9_-]/g, "");
    const dir = path.join(SCREENSHOTS_ROOT, safeScanId);
    fs.mkdirSync(dir, { recursive: true });

    const filename = `page-${pageIndex}.png`;
    await page.screenshot({ path: path.join(dir, filename), fullPage: false });
    return `/api/screenshots/${safeScanId}/${filename}`;
  } catch {
    return undefined;
  }
}

export async function runExplorer(targetUrl, maxPages = 5, scanId = "default") {
  const origin = new URL(targetUrl).origin;
  const visited = new Set();
  const queue = [targetUrl];
  const rawBugs = [];
  const pageEvidence = new Map();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let currentPageUrl = targetUrl;

  // 1. Capture JS console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      rawBugs.push({
        id: crypto.randomUUID(),
        type: "console_error",
        pageUrl: currentPageUrl,
        description: `Console error: ${msg.text()}`,
        severity: "medium",
        detectionSource: "runtime",
      });
    }
  });

  // 2. Capture uncaught runtime exceptions
  page.on("pageerror", (err) => {
    rawBugs.push({
      id: crypto.randomUUID(),
      type: "console_error",
      pageUrl: currentPageUrl,
      description: `Uncaught page error: ${err.message}`,
      severity: "high",
      detectionSource: "runtime",
    });
  });

  // 3. Capture failed network/API responses (4xx / 5xx)
  page.on("response", (res) => {
    if (res.status() >= 400) {
      rawBugs.push({
        id: crypto.randomUUID(),
        type: "network_error",
        pageUrl: currentPageUrl,
        description: `HTTP ${res.status()} on ${res.url()}`,
        severity: res.status() >= 500 ? "high" : "medium",
        detectionSource: "runtime",
      });
    }
  });

  // 4. Crawl pages (same-origin only, capped at maxPages)
  try {
    let pageIndex = 0;
    while (queue.length > 0 && visited.size < maxPages) {
      const url = queue.shift();
      if (visited.has(url)) continue;
      visited.add(url);
      currentPageUrl = url;
      pageIndex += 1;

      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

        // Always capture screenshot & sanitized DOM for the loaded page
        const screenshotPath = await captureScreenshot(page, scanId, pageIndex);
        const domSnapshot = await captureSafeDom(page);
        pageEvidence.set(url, { screenshotPath, domSnapshot });

        if (!response || response.status() >= 400) {
          rawBugs.push({
            id: crypto.randomUUID(),
            type: "broken_link",
            pageUrl: url,
            description: `Page failed to load (status ${response ? response.status() : "no response"})`,
            severity: "high",
            detectionSource: "runtime",
          });
          continue;
        }

        // Collect internal links to crawl next (read-only; never submits forms)
        const links = await page.$$eval("a[href]", (anchors) =>
          anchors.map((a) => a.href).filter(Boolean)
        );
        for (const link of links) {
          if (link.startsWith(origin) && !visited.has(link) && !queue.includes(link)) {
            queue.push(link);
          }
        }
      } catch (err) {
        const screenshotPath = await captureScreenshot(page, scanId, pageIndex);
        const domSnapshot = await captureSafeDom(page);
        pageEvidence.set(url, { screenshotPath, domSnapshot });

        rawBugs.push({
          id: crypto.randomUUID(),
          type: "broken_link",
          pageUrl: url,
          description: `Navigation error: ${err.message}`,
          severity: "high",
          detectionSource: "runtime",
        });
      }
    }
  } finally {
    await browser.close();
  }

  // Attach each page's screenshot & sanitized DOM snapshot to its bugs and validate
  const bugs = rawBugs.map((bug) => {
    const ev = pageEvidence.get(bug.pageUrl) || {};
    return BugObjectSchema.parse({
      ...bug,
      screenshotPath: ev.screenshotPath,
      domSnapshot: ev.domSnapshot,
    });
  });

  return {
    scannedPages: Array.from(visited),
    bugs,
  };
}

// Allow running directly from the terminal for quick testing
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const testUrl = process.argv[2] || "https://example.com/broken-page";
  console.log(`Exploring ${testUrl}...`);
  const result = await runExplorer(testUrl, 2, "cli-test");
  console.log("Scanned:", result.scannedPages);
  console.log("Bugs:", result.bugs.length, "Screenshot:", result.bugs[0]?.screenshotPath);
}