import { Router } from "express";
import { testTriage } from "../controllers/triageController.js";
import {
  handleSingleTriage,
  handleBatchTriage,
  getTriageResults,
  clearTriageResults,
} from "../controllers/triageController.js";

const router = Router();

router.post("/test", testTriage);
router.get("/results", getTriageResults);
router.delete("/results", clearTriageResults);

// Single Message Triage Endpoint
router.post("/", handleSingleTriage);

// Batch Message Triage Endpoint
router.post("/batch", handleBatchTriage);

export default router;
