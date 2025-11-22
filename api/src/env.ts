import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    PORT: z.number().default(3001),
  },
  runtimeEnv: process.env,
});
