import { db } from "db";
import { logEntity } from "db/entities/log/log.entity";
import { envConfig } from "env";
import pino from "pino";

export const log = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        options: {
          destination: envConfig.LOG_PATH,
        },
      },
    ],
  },
  level: "info",
});

const dbLog = async (
  obj: unknown,
  tag: string,
  type: "info" | "error" | "warn" | "debug"
) => {
  await db.insert(logEntity).values({ tag, type, obj });
};

const info = (obj: unknown, tag: string) => {
  void dbLog(obj, tag, "info");

  log.info(obj, tag);
};

const error = (obj: unknown, tag: string) => {
  void dbLog(obj, tag, "error");
  log.error(obj, tag);
};

const warn = (obj: unknown, tag: string) => {
  void dbLog(obj, tag, "warn");

  log.warn(obj, tag);
};

const debug = (obj: unknown, tag: string) => {
  void dbLog(obj, tag, "debug");

  log.debug(obj, tag);
};

export const logger = {
  info,
  error,
  warn,
  debug,
};
