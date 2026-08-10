import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { processSingleMessage } from "./triageService.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to insert delay between API requests to prevent 429 rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const runEvaluationSuite = async () => {
  const groundTruthPath = path.resolve(
    __dirname,
    "../../../data/ground-truth.json",
  );
  const resultsOutputPath = path.resolve(
    __dirname,
    "../../../evaluation/results.json",
  );

  let groundTruthData;
  try {
    const rawData = await fs.readFile(groundTruthPath, "utf-8");
    groundTruthData = JSON.parse(rawData);
  } catch (err) {
    logger.error("Failed to load ground-truth dataset:", err.message);
    throw new Error("Could not load data/ground-truth.json dataset");
  }

  let categoryMatches = 0;
  let priorityMatches = 0;
  let humanEscalationMatches = 0;
  let perfectMatches = 0;

  const itemizedResults = [];
  const failureLog = [];

  for (let i = 0; i < groundTruthData.length; i++) {
    const item = groundTruthData[i];

    // Wait 2 seconds between API calls to avoid triggering Gemini 429 rate-limits
    if (i > 0) {
      await sleep(2000);
    }

    const aiOutput = await processSingleMessage({
      id: item.id,
      text: item.text,
    });
    const pred = aiOutput.result;

    const catMatch = pred.category === item.expected_category;
    const prioMatch = pred.priority === item.expected_priority;
    const humanMatch = pred.needs_human === item.expected_needs_human;

    if (catMatch) categoryMatches++;
    if (prioMatch) priorityMatches++;
    if (humanMatch) humanEscalationMatches++;

    const isPerfect = catMatch && prioMatch && humanMatch;
    if (isPerfect) perfectMatches++;

    if (!isPerfect) {
      failureLog.push({
        id: item.id,
        text: item.text,
        discrepancies: {
          category: !catMatch
            ? { expected: item.expected_category, got: pred.category }
            : undefined,
          priority: !prioMatch
            ? { expected: item.expected_priority, got: pred.priority }
            : undefined,
          needs_human: !humanMatch
            ? { expected: item.expected_needs_human, got: pred.needs_human }
            : undefined,
        },
      });
    }

    itemizedResults.push({
      id: item.id,
      text: item.text,
      expected: {
        category: item.expected_category,
        priority: item.expected_priority,
        needs_human: item.expected_needs_human,
      },
      actual: {
        category: pred.category,
        priority: pred.priority,
        needs_human: pred.needs_human,
        confidence: pred.confidence,
      },
      matches: {
        category: catMatch,
        priority: prioMatch,
        needs_human: humanMatch,
        perfect: isPerfect,
      },
    });
  }

  const total = groundTruthData.length;
  const evaluationSummary = {
    evaluatedAt: new Date().toISOString(),
    totalMessages: total,
    categoryAccuracy: `${categoryMatches}/${total} (${Math.round((categoryMatches / total) * 100)}%)`,
    priorityAccuracy: `${priorityMatches}/${total} (${Math.round((priorityMatches / total) * 100)}%)`,
    humanEscalationAgreement: `${humanEscalationMatches}/${total} (${Math.round((humanEscalationMatches / total) * 100)}%)`,
    overallPerfectAgreement: `${perfectMatches}/${total} (${Math.round((perfectMatches / total) * 100)}%)`,
    accuracyScorePct: Math.round((perfectMatches / total) * 100),
    failureCount: failureLog.length,
    failures: failureLog,
    details: itemizedResults,
  };

  try {
    await fs.mkdir(path.dirname(resultsOutputPath), { recursive: true });
    await fs.writeFile(
      resultsOutputPath,
      JSON.stringify(evaluationSummary, null, 2),
    );
  } catch (err) {
    logger.error("Failed to write evaluation results file:", err.message);
  }

  return evaluationSummary;
};
