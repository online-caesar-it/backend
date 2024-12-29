import { config } from "dotenv";

export const envConfig = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET_KEY: process.env.SECRET_KEY,
};

config();
