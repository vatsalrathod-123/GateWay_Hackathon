import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

// Boot DB connection (non-blocking) then start web server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 FRONTLINE AI Server running on port ${PORT}`);
    logger.info(`👉 Healthcheck available at http://localhost:${PORT}/api/health`);
  });
});