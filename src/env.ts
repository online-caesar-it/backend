import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.string().nonempty("PORT is required"),
  DATABASE_URL: z.string().nonempty("DATABASE_URL is required"),
  SECRET_KEY: z.string().nonempty("SECRET_KEY is required"),
  NODE_ENV: z.string().nonempty("NODE_ENV is required").default("production"),
  SMTP_HOST: z.string().nonempty("SMTP_HOST is required"),
  SMTP_PORT: z.string().nonempty("SMTP_PORT is required"),
  SMTP_USER: z.string().nonempty("SMTP_USER is required"),
  SMTP_PASS: z.string().nonempty("SMTP_PASS is required"),
  SMTP_FROM: z.string().nonempty("SMTP_FROM is required"),
  FRONTEND_URL: z.string().nonempty("FRONTEND_URL is required"),
  FRONTEND_PORTAL_URL: z.string().nonempty("FRONTEND_PORTAL_URL is required"),
  LOG_PATH: z.string().default("./logs.log"),
  HOST: z.string().nonempty("HOST is required"),
  WS_PORT: z.string().nonempty("WS_PORT is required"),
  TELEGRAM_BOT_TOKEN: z.string().nonempty("TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_GROUPS: z.string().nonempty("TELEGRAM_GROUPS is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(" Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const envConfig = parsedEnv.data;
