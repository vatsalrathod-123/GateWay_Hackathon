import { logger } from "../utils/logger.js";

export const applyGuardrails = (triageResult, rawMessageText) => {
  // Create a mutable copy of the result object
  let processed = { ...triageResult };
  let guardrailTriggers = [];

  const textLower = (rawMessageText || "").toLowerCase();

  // 1. Confidence Threshold Guardrail
  if (processed.confidence < 0.7) {
    processed.needs_human = true;
    guardrailTriggers.push(
      `Low confidence score (${processed.confidence} < 0.70) forced human review.`,
    );
  }

  // 2. High-Risk Category & Priority Override Guardrails
  const highRiskCategories = [
    "security",
    "billing",
    "refund",
    "account_access",
  ];
  if (
    highRiskCategories.includes(processed.category) &&
    (processed.priority === "P0" || processed.priority === "P1")
  ) {
    processed.needs_human = true;
    guardrailTriggers.push(
      `High-risk category (${processed.category}) with critical priority (${processed.priority}) mandates human oversight.`,
    );
  }

  // 3. Prompt Injection Heuristic Check
  const injectionKeywords = [
    "ignore previous instructions",
    "system prompt",
    "reveal api key",
    "you are now",
    "disregard all rules",
    "print instructions",
  ];

  const suspectInjection = injectionKeywords.some((keyword) =>
    textLower.includes(keyword),
  );
  if (suspectInjection) {
    processed.category = "security";
    processed.priority = "P0";
    processed.needs_human = true;
    processed.summary =
      "Potential prompt injection or adversarial jailbreak attempt detected in customer payload.";
    processed.suggested_action =
      "Review message text manually. Ensure no internal instructions or credentials were exposed.";
    guardrailTriggers.push(
      "Adversarial prompt injection pattern detected. Overrode classification to security/P0.",
    );
  }

  // Attach guardrail metadata log
  processed.guardrail_applied = guardrailTriggers.length > 0;
  processed.guardrail_notes = guardrailTriggers;

  if (guardrailTriggers.length > 0) {
    logger.info(`Guardrails triggered modifications:`, guardrailTriggers);
  }

  return processed;
};
