import config from "@/config";
import { logger } from "@/lib/winston";
import type { ConnectOptions } from "mongoose";
import mongoose from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "leetcode",
  appName: "LeetCode",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error("MongoDB URI is not defined in the configrutaion!");
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);

    logger.info("Connected to the database succesfully ✅✅✅.", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    logger.error("Error connecting to the database.", error);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    logger.info("Disconnected from the database successfully ✅!", {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    logger.error("Error disconnecting form the database.", error);
  }
};
