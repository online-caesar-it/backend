import { envConfig } from "./src/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/entities/**/*.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: String(envConfig.DATABASE_URL),
  },
});
