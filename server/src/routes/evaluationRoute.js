import { Router } from "express";
import { runEvaluation } from "../controllers/evaluationController.js";

const router = Router();

router.post("/run", runEvaluation);

export default router;
