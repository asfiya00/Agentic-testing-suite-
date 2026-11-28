import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    id: String,
    type: String,
    pageUrl: String,
    description: String,
    severity: String,
    detectionSource: String,
    status: { type: String, default: "open" },
    filePath: { type: String, default: null },
    lineNumber: { type: Number, default: null },
    staticFindings: [String],
    screenshotPath: { type: String, default: null },
    domSnapshot: { type: String, default: null },
  },
  { _id: false }
);

const patchSchema = new mongoose.Schema(
  {
    bugId: String,
    diff: String,
    branchName: String,
    prUrl: { type: String, default: null },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    bugId: String,
    passed: Boolean,
    reason: String,
    attempt: Number,
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    repoUrl: { type: String, required: true },
    liveUrl: { type: String },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    scannedPages: [String],
    bugs: [bugSchema],
    patches: [patchSchema],
    verifications: [verificationSchema],
    error: String,
  },
  { timestamps: true }
);

export const Scan = mongoose.model("Scan", scanSchema);