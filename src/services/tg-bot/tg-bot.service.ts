import { envConfig } from "env";
import { Bot } from "grammy";
export type Alert = {
  tag: string;
  obj: Record<string, unknown>;
};

let bot: Bot | undefined;

if (envConfig.TELEGRAM_BOT_TOKEN) {
  bot = new Bot(envConfig.TELEGRAM_BOT_TOKEN);
}

const groups = {
  info: (envConfig.TELEGRAM_GROUPS?.split(",") ?? [])[0] ?? "",
  error: (envConfig.TELEGRAM_GROUPS?.split(",") ?? [])[1] ?? "",
};

const sendTelegramAlert = async (
  level: "info" | "error",
  tag: string,
  message: Alert[] | Record<string, unknown>
) => {
  try {
    if (!bot) {
      return;
    }

    bot?.start().catch(() => null);

    let msg = "";

    if (Array.isArray(message)) {
      msg = message
        .map(
          (it) =>
            `*${it.tag}*\n\n` +
            "```json\n" +
            JSON.stringify(it.obj, null, 2) +
            "\n```"
        )
        .join("\n\n");
    } else {
      msg =
        `*${tag}*\n\n` +
        "```json\n" +
        JSON.stringify(message, null, 2) +
        "\n```";
    }

    await bot.api.sendMessage(groups[level], msg, { parse_mode: "Markdown" });

    await bot.stop();
  } catch (e) {
    console.error("Ошибка отправки сообщения в Telegram:", e);
  }
};

export const tgBotService = {
  sendTelegramAlert,
};
