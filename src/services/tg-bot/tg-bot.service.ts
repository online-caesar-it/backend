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
        .map((it) => {
          const { fio, phoneNumber, email } = it.obj as Record<string, string>;
          return `🔔 *${it.tag}*\n\n👤 ФИО: *${fio}*\n📞 Телефон: *${phoneNumber}*\n📧 Email: *${email}*`;
        })
        .join("\n\n");
    } else {
      const { fio, phoneNumber, email } = message as Record<string, string>;
      msg = `🔔 *${tag}*\n\n👤 ФИО: *${fio}*\n📞 Телефон: *${phoneNumber}*\n📧 Email: *${email}*`;
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
