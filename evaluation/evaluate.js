import { runEvaluationSuite } from "../server/src/services/evaluationService.js";

console.log("====================================================");
console.log("🧪 FRONTLINE AI — BENCHMARK EVALUATION SUITE");
console.log("====================================================\n");

async function executeCLI() {
  try {
    console.log("Evaluating AI engine against ground-truth dataset...\n");
    const report = await runEvaluationSuite();

    console.log(`📊 EVALUATION SUMMARY REPORT (${report.evaluatedAt})`);
    console.log(`----------------------------------------------------`);
    console.log(`• Total Messages Evaluated : ${report.totalMessages}`);
    console.log(`• Category Accuracy        : ${report.categoryAccuracy}`);
    console.log(`• Priority Accuracy        : ${report.priorityAccuracy}`);
    console.log(
      `• Human Escalation Accord  : ${report.humanEscalationAgreement}`,
    );
    console.log(
      `• Perfect Overall Score    : ${report.overallPerfectAgreement}`,
    );
    console.log(`----------------------------------------------------`);

    if (report.failureCount > 0) {
      console.log(`\n⚠️ DISCREPANCIES DETECTED (${report.failureCount}):`);
      report.failures.forEach((f) => {
        console.log(`\n[ID #${f.id}] "${f.text}"`);
        if (f.discrepancies.category) {
          console.log(
            `  - Category   => Expected: ${f.discrepancies.category.expected} | Got: ${f.discrepancies.category.got}`,
          );
        }
        if (f.discrepancies.priority) {
          console.log(
            `  - Priority   => Expected: ${f.discrepancies.priority.expected} | Got: ${f.discrepancies.priority.got}`,
          );
        }
        if (f.discrepancies.needs_human) {
          console.log(
            `  - NeedsHuman => Expected: ${f.discrepancies.needs_human.expected} | Got: ${f.discrepancies.needs_human.got}`,
          );
        }
      });
    } else {
      console.log("\n✨ PERFECT ACCURACY MATCH ACROSS ALL BENCHMARK MESSAGES!");
    }

    console.log("\n📄 Complete JSON report saved to evaluation/results.json\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Evaluation suite failed:", err.message);
    process.exit(1);
  }
}

executeCLI();
