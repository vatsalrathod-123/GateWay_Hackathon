import { isDbConnected } from "../config/db.js";
import { TriageResultModel } from "../models/TriageResult.js";
import { logger } from "../utils/logger.js";

// In-Memory Storage Cache for zero-dependency execution
const memoryStore = [];

export const saveTriageRecord = async (triageData) => {
  const record = {
    messageId: String(triageData.messageId || "auto_" + Date.now()),
    rawText: triageData.rawText || "",
    category: triageData.result.category,
    priority: triageData.result.priority,
    summary: triageData.result.summary,
    suggested_action: triageData.result.suggested_action,
    needs_human: triageData.result.needs_human,
    confidence: triageData.result.confidence,
    guardrail_applied: triageData.result.guardrail_applied || false,
    guardrail_notes: triageData.result.guardrail_notes || [],
    is_fallback: triageData.result.is_fallback || false,
    processingTimeMs: triageData.metrics?.processingTimeMs || 0,
    createdAt: new Date(),
  };

  if (isDbConnected) {
    try {
      const doc = await TriageResultModel.create(record);
      return doc.toObject();
    } catch (err) {
      logger.error(
        "Failed to save to MongoDB, writing to in-memory store:",
        err.message,
      );
    }
  }

  // Fallback to in-memory store
  memoryStore.unshift(record); // Prepend so newest appears first
  return record;
};

export const saveBatchRecords = async (batchResults) => {
  const savedItems = [];
  for (const item of batchResults) {
    if (item.result) {
      const saved = await saveTriageRecord(item);
      savedItems.push(saved);
    }
  }
  return savedItems;
};

export const fetchAllTriageResults = async () => {
  if (isDbConnected) {
    try {
      return await TriageResultModel.find().sort({ createdAt: -1 }).lean();
    } catch (err) {
      logger.error(
        "Failed to fetch from MongoDB, returning in-memory data:",
        err.message,
      );
    }
  }

  return memoryStore;
};

export const clearAllTriageResults = async () => {
  if (isDbConnected) {
    try {
      await TriageResultModel.deleteMany({});
    } catch (err) {
      logger.error("Failed to clear Mongo records:", err.message);
    }
  }
  memoryStore.length = 0; // Clear memory array
};
