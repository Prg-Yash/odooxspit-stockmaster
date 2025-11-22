import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    PORT: z.number().default(3001),
    CORS_ORIGIN: z.string(),
  },
  runtimeEnv: process.env,
});
