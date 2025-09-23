import type ms from "ms";

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,
  WHITELIST_ORIGINS: ["http://localhost:5173", "http://localhost:3000"],
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  WHITELIST_ADMINS_MAIL: ["abdulazizkxon19@gmail.com", "coderdim2@gmail.com"],
  MONGO_URI: process.env.MONGO_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue,
  defaultResLimit: 20,
  defaultResOffset: 0,
};

export default config;
