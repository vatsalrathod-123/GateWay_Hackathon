import { classifyMessageWithAI } from "../services/aiService.js";
import {
  inputMessageSchema,
  createFallbackTriage,
} from "../schemas/triageSchema.js";
import {
  processSingleMessage,
  processBatchMessages,
} from "../services/triageService.js";
import {
  fetchAllTriageResults,
  clearAllTriageResults,
  saveTriageRecord,
} from "../services/storageService.js";

export const testTriage = async (req, res, next) => {
  try {
    // Validate input payload before calling AI
    const inputValidation = inputMessageSchema.safeParse(req.body);

    if (!inputValidation.success) {
      // Handles garbage input gracefully without crashing
      const errorMessage =
        inputValidation.error.issues[0]?.message || "Invalid input data";
      return res.status(200).json({
        success: false,
        result: createFallbackTriage(`Invalid Input: ${errorMessage}`),
        inputValidationError: errorMessage,
      });
    }

    const { text } = inputValidation.data;
    const aiResult = await classifyMessageWithAI(text);

    return res.status(200).json({
      success: aiResult.success,
      result: aiResult.data,
      metrics: aiResult.metrics,
      ...(aiResult.validationErrors && {
        validationErrors: aiResult.validationErrors,
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const handleSingleTriage = async (req, res, next) => {
  try {
    const triageOutput = await processSingleMessage(req.body);
    await saveTriageRecord(triageOutput); // Persist the result
    return res.status(200).json(triageOutput);
  } catch (error) {
    next(error);
  }
};

export const handleBatchTriage = async (req, res, next) => {
  try {
    const { messages } = req.body;
    const batchOutput = await processBatchMessages(messages);
    return res.status(200).json(batchOutput);
  } catch (error) {
    next(error);
  }
};

export const getTriageResults = async (req, res, next) => {
  try {
    const records = await fetchAllTriageResults();
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

export const clearTriageResults = async (req, res, next) => {
  try {
    await clearAllTriageResults();
    return res
      .status(200)
      .json({ success: true, message: "All results cleared." });
  } catch (error) {
    next(error);
  }
};
