import "dotenv/config";

import router from "@/routes/index";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express from "express";
import config from "./config";
import limit from "./lib/express.rate.limit";
import { connectToDatabase, disconnectFromDatabase } from "./lib/mongoose";
import { logger } from "./lib/winston";

const app = express();

// corsOptions
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limit);

(async () => {
  try {
    await connectToDatabase();

    app.use("/api", router);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the server", error);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();

    logger.warn("Server is shutting down.");
    process.exit(0);
  } catch (error) {
    logger.error("Error shutting down the server.", error);
  }
};

process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);
