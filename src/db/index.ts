import { drizzle } from "drizzle-orm/postgres-js";

import { entities } from "./entities/index";
import { envConfig } from "../env";
import postgres = require("postgres");

if (!envConfig) {
  throw new Error("env not defined");
}
const queryClient = postgres(String(envConfig.DATABASE_URL));

export const db = drizzle(queryClient, { schema: entities });
