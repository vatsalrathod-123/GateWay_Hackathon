import { GoogleGenAI } from "@google/genai";
import { config } from "../config/env.js";
import {
  SYSTEM_TRIAGE_INSTRUCTION,
  buildTriagePrompt,
} from "../prompts/triagePrompt.js";
import {
  aiTriageOutputSchema,
  createFallbackTriage,
} from "../schemas/triageSchema.js";
import { logger } from "../utils/logger.js";

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const classifyMessageWithAI = async (messageText) => {
  const startTime = Date.now();

  try {
    const userPrompt = buildTriagePrompt(messageText);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_TRIAGE_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const latencyMs = Date.now() - startTime;
    const rawText = response.text;

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      logger.warn(
        "AI response was not valid JSON string. Triggering safe fallback.",
        parseErr.message,
      );
      return {
        success: false,
        data: createFallbackTriage("JSON parsing failure from AI output"),
        metrics: { latencyMs, usage: response.usageMetadata || null },
      };
    }

    // Run Zod validation on parsed output
    const validationResult = aiTriageOutputSchema.safeParse(parsedData);

    if (!validationResult.success) {
      logger.warn(
        "AI Output failed Zod validation rules:",
        validationResult.error.format(),
      );
      return {
        success: false,
        data: createFallbackTriage(
          `Zod Schema Validation Failure: ${validationResult.error.issues[0]?.message}`,
        ),
        validationErrors: validationResult.error.issues,
        metrics: { latencyMs, usage: response.usageMetadata || null },
      };
    }

    return {
      success: true,
      data: validationResult.data,
      metrics: {
        latencyMs,
        usage: response.usageMetadata || null,
      },
    };
  } catch (error) {
    logger.error("Critical failure in classifyMessageWithAI:", error.message);
    return {
      success: false,
      data: createFallbackTriage(`AI Execution Error: ${error.message}`),
      metrics: { latencyMs: Date.now() - startTime, usage: null },
    };
  }
};
