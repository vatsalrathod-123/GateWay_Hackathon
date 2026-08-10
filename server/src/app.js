import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

import triageRoutes from "./routes/triageRoute.js";
import evaluationRoutes from "./routes/evaluationRoute.js";

const app = express();

// Security & Core Middleware
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Apply rate limiting to all /api routes
app.use("/api/", apiLimiter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "FRONTLINE AI Engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    geminiConfigured: Boolean(config.geminiApiKey),
  });
});

// Triage API Routes
app.use("/api/triage", triageRoutes);

// Evaluation API Routes
app.use("/api/evaluation", evaluationRoutes);

// Centralized Error Handler
app.use(errorHandler);

export default app;
