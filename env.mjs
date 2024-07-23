import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Iron session requires a secret of at least 32 characters
    // Comma separated list of Ethereum addresses, accepts optinal whitespace after comma
    SITE_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_USE_PUBLIC_PROVIDER: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_USE_HARDHAT_PROVIDER: z
      .enum(["true", "false"])
      .default("false"),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_INFURA_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_USE_PUBLIC_PROVIDER:
      process.env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER,
    NEXT_PUBLIC_USE_HARDHAT_PROVIDER:
      process.env.NEXT_PUBLIC_USE_HARDHAT_PROVIDER,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
});
