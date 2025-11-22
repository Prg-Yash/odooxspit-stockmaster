import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    PORT: z.number().default(3001),
    CORS_ORIGIN: z.string(),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string(),
    REFRESH_TOKEN_EXPIRES_DAYS: z.string(),
  },
  runtimeEnv: process.env,
});
