import { runEvaluationSuite } from "../services/evaluationService.js";

export const runEvaluation = async (req, res, next) => {
  try {
    const report = await runEvaluationSuite();
    return res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};
