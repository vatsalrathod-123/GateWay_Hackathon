import mongoose from "mongoose";
import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export let isDbConnected = false;

export const connectDB = async () => {
  if (!config.mongoUri) {
    logger.warn(
      "⚠️ MONGO_URI not configured. Operating in IN-MEMORY storage mode.",
    );
    return false;
  }

  try {
    // 3-second timeout so server startup isn't delayed if Mongo is offline
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isDbConnected = true;
    logger.info("🟢 Connected to MongoDB successfully.");
    return true;
  } catch (err) {
    isDbConnected = false;
    logger.warn(
      `⚠️ MongoDB connection failed (${err.message}). Defaulting to IN-MEMORY storage.`,
    );
    return false;
  }
};
