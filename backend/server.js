import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { Scan } from "./models/Scan.js";
import { ScanRequestSchema } from "../shared/schemas.js";
import { runPipeline } from "../orchestrator/pipeline.js";
import { askLLM } from "../shared/llm.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.use("/api/screenshots", express.static(path.join(__dirname, "uploads/screenshots")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, dbState: mongoose.connection.readyState });
});

// List all scans (newest first)
app.get("/api/scans", async (req, res) => {
  const scans = await Scan.find().sort({ createdAt: -1 }).limit(20);
  res.json(scans);
});

// Get one scan by ID
app.get("/api/scans/:id", async (req, res) => {
  const scan = await Scan.findById(req.params.id);
  if (!scan) return res.status(404).json({ error: "Scan not found" });
  res.json(scan);
});

// Start a new scan (runs the full 5-agent LangGraph pipeline)
app.post("/api/scans", async (req, res) => {
  const parsed = ScanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { repoUrl, liveUrl, maxPages } = parsed.data;
  if (!liveUrl) {
    return res.status(400).json({
      error: "For this basic version, please provide a liveUrl alongside repoUrl.",
    });
  }

  const scan = await Scan.create({ repoUrl, liveUrl, status: "running" });
  res.status(202).json(scan);

  try {
    const result = await runPipeline({
      repoUrl,
      liveUrl,
      maxPages,
      scanId: scan._id.toString(),
      onLog: ({ agent, message }) => io.emit("agent:log", { scanId: scan._id, agent, message }),
    });

    scan.scannedPages = result.scannedPages;
    scan.bugs = result.bugs;
    scan.patches = result.patches;
    scan.verifications = result.verifications;
    scan.status = "completed";
    await scan.save();

    io.emit("agent:log", {
      scanId: scan._id,
      agent: "Orchestrator",
      message: `Pipeline complete. ${result.bugs.length} bug(s), ${result.patches.length} patch(es).`,
    });
    io.emit("scan:updated", scan);
  } catch (err) {
    scan.status = "failed";
    scan.error = err.message;
    await scan.save();
    io.emit("agent:log", { scanId: scan._id, agent: "Orchestrator", message: `Failed: ${err.message}` });
    io.emit("scan:updated", scan);
  }
});

// Chatbot endpoint: answers questions using stored MongoDB scans (or pasted code snippets)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const recentScans = await Scan.find().sort({ createdAt: -1 }).limit(3);
    const contextSummary = recentScans.map((s) => ({
      id: s._id,
      repoUrl: s.repoUrl,
      liveUrl: s.liveUrl,
      status: s.status,
      bugs: (s.bugs || []).map((b) => ({
        id: b.id,
        type: b.type,
        pageUrl: b.pageUrl,
        description: b.description,
        severity: b.severity,
        filePath: b.filePath,
        status: b.status,
      })),
      verifications: s.verifications || [],
    }));

    const prompt = `You are the Sentinel QA Assistant. Answer the user's question concisely using the stored scan data below (or explain any code snippet they pasted).

Recent scans in MongoDB:
${JSON.stringify(contextSummary, null, 2)}

User question:
${message}`;

    const reply = await askLLM(prompt);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    server.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });