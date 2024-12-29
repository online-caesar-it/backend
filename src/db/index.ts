import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { entities } from "./entities/index";
import { envConfig } from "env";

if (!envConfig) {
  throw new Error("env not defined");
}
const queryClient = postgres(String(envConfig.DATABASE_URL));

export const db = drizzle(queryClient, { schema: entities });
