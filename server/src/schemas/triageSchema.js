import { z } from "zod";

// Allowed Category Constants
export const ALLOWED_CATEGORIES = [
  "billing",
  "technical_support",
  "account_access",
  "order_issue",
  "refund",
  "complaint",
  "feature_request",
  "general_question",
  "security",
  "out_of_scope",
  "other",
];

// Allowed Priority Constants
export const ALLOWED_PRIORITIES = ["P0", "P1", "P2", "P3"];

// Input Message Validator (Applied BEFORE sending to Gemini)
export const inputMessageSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  text: z
    .string({
      required_error: "Message text is required",
    })
    .trim()
    .min(1, "Message text cannot be empty")
    .max(10000, "Message exceeds maximum length of 10,000 characters"),
});

// AI Output Validation Schema (Applied AFTER receiving Gemini response)
export const aiTriageOutputSchema = z.object({
  category: z.enum(ALLOWED_CATEGORIES, {
    errorMap: () => ({ message: "Invalid or unrecognized triage category" }),
  }),
  priority: z.enum(ALLOWED_PRIORITIES, {
    errorMap: () => ({ message: "Priority must be one of P0, P1, P2, P3" }),
  }),
  summary: z.string().min(3, "Summary must be at least 3 characters").max(500),
  suggested_action: z
    .string()
    .min(3, "Suggested action must be at least 3 characters")
    .max(1000),
  needs_human: z.boolean(),
  confidence: z.number().min(0.0).max(1.0),
});

// Safe Fallback Generator (Guarantees system continuity if AI output is corrupted)
export const createFallbackTriage = (
  reason = "System fallback due to validation error",
) => {
  return {
    category: "other",
    priority: "P1",
    summary:
      "Unable to automatically summarize due to processing ambiguity or malformed response.",
    suggested_action:
      "Human operator must manually review and classify this incoming message.",
    needs_human: true,
    confidence: 0.0,
    is_fallback: true,
    fallback_reason: reason,
  };
};
