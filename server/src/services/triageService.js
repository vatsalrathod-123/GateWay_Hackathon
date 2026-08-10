import { classifyMessageWithAI } from "./aiService.js";
import { applyGuardrails } from "./guardrailService.js";
import {
  inputMessageSchema,
  createFallbackTriage,
} from "../schemas/triageSchema.js";
import { logger } from "../utils/logger.js";
import { saveTriageRecord, saveBatchRecords } from "./storageService.js";

export const processSingleMessage = async (rawInput) => {
  const startTime = Date.now();

  try {
    // Step 1: Validate input payload structure
    const inputValidation = inputMessageSchema.safeParse(rawInput);

    if (!inputValidation.success) {
      const errorMsg =
        inputValidation.error.issues[0]?.message ||
        "Invalid message input format";

      logger.warn(`Input validation failed: ${errorMsg}`);

      return {
        success: false,
        messageId: rawInput?.id || null,
        rawText: rawInput?.text || "",
        result: createFallbackTriage(`Input Validation Error: ${errorMsg}`),
        processingTimeMs: Date.now() - startTime,
      };
    }

    const { id, text } = inputValidation.data;

    // Step 2: Call Gemini AI Classification
    const aiResponse = await classifyMessageWithAI(text);

    // Step 3: Apply Application-Level Guardrails & Risk Checks
    const finalizedResult = applyGuardrails(aiResponse.data, text);

    const processingTimeMs = Date.now() - startTime;

    // Step 4: Prepare final output
    const output = {
      success: aiResponse.success,
      messageId: id || "auto_" + Math.random().toString(36).substring(2, 9),
      rawText: text,
      result: finalizedResult,
      metrics: {
        ...aiResponse.metrics,
        processingTimeMs,
      },
    };

    // Step 5: Persist to storage
    // await saveTriageRecord(output);

    return output;
  } catch (error) {
    logger.error(
      "Unexpected error in triageService.processSingleMessage:",
      error.message,
    );

    return {
      success: false,
      messageId: rawInput?.id || null,
      rawText: rawInput?.text || "",
      result: createFallbackTriage(
        `Pipeline Execution Exception: ${error.message}`,
      ),
      processingTimeMs: Date.now() - startTime,
    };
  }
};

export const processBatchMessages = async (messagesArray) => {
  const startTime = Date.now();

  if (!Array.isArray(messagesArray) || messagesArray.length === 0) {
    return {
      success: false,
      error: 'Payload must contain a non-empty "messages" array.',
      results: [],
      summary: null,
    };
  }

  // Process all messages in parallel with error isolation
  const processPromises = messagesArray.map((msgItem) =>
    processSingleMessage(msgItem).catch((err) => ({
      success: false,
      messageId: msgItem?.id || null,
      rawText: msgItem?.text || "",
      result: createFallbackTriage(
        `Unhandled Processing Exception: ${err.message}`,
      ),
      metrics: {
        latencyMs: 0,
        processingTimeMs: 0,
      },
    })),
  );

  const results = await Promise.all(processPromises);

  const totalBatchTimeMs = Date.now() - startTime;

  // Calculate Aggregated Metrics & Analytics Summary
  const total = results.length;
  let humanReviewCount = 0;
  let totalConfidence = 0;

  const priorityCounts = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
  };

  const categoryCounts = {};

  results.forEach((res) => {
    const data = res.result;

    if (data.needs_human) {
      humanReviewCount++;
    }

    totalConfidence += data.confidence || 0;

    if (priorityCounts[data.priority] !== undefined) {
      priorityCounts[data.priority]++;
    }

    categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
  });

  const summary = {
    totalMessages: total,
    autoResolvedCount: total - humanReviewCount,
    humanReviewCount,

    avgConfidence:
      total > 0 ? parseFloat((totalConfidence / total).toFixed(2)) : 0,

    priorityDistribution: priorityCounts,
    categoryDistribution: categoryCounts,

    totalBatchTimeMs,

    avgLatencyPerMessageMs:
      total > 0 ? Math.round(totalBatchTimeMs / total) : 0,
  };

  // Persist all batch results to storage (Mongo or RAM)
  await saveBatchRecords(results);

  return {
    success: true,
    summary,
    results,
  };
};
