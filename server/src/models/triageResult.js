import mongoose from "mongoose";

const triageResultSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  rawText: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  summary: { type: String, required: true },
  suggested_action: { type: String, required: true },
  needs_human: { type: Boolean, required: true },
  confidence: { type: Number, required: true },
  guardrail_applied: { type: Boolean, default: false },
  guardrail_notes: [{ type: String }],
  is_fallback: { type: Boolean, default: false },
  processingTimeMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const TriageResultModel = mongoose.model(
  "TriageResult",
  triageResultSchema,
);
