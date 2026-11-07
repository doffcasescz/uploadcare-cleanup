import { CONFIG } from "./config.js";

export type TelegramMessage = {
  title: string;
  body: string | string[];
  emoji?: string;
};

// https://api.telegram.org/bot{CONFIG.TELEGRAM.BOT_TOKEN}/getUpdates

async function sendTelegramMessage(text: string): Promise<void> {
  if (!CONFIG.TELEGRAM.BOT_TOKEN || !CONFIG.TELEGRAM.CHAT_ID) {
    console.error(
      "CONFIG.TELEGRAM.BOT_TOKEN or CONFIG.TELEGRAM.CHAT_ID is missing. Skipping message send.",
    );
    return;
  }

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CONFIG.TELEGRAM.CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Telegram API error (${response.status}): ${errorBody}`);
  }
}

/**
 * Creates a formatted message for Telegram with optional emoji
 * */
function formatMessage(message: TelegramMessage) {
  let msg = "";

  if (message.emoji) {
    msg += `${message.emoji} `;
  }

  msg += `<b>${message.title}</b>\n`;

  if (Array.isArray(message.body)) {
    msg += message.body.join("\n");
  } else {
    msg += message.body;
  }

  return msg;
}

export const telegram = {
  formatMsg: formatMessage,
  sendMsg: sendTelegramMessage,
  sendFormattedMsg: async (message: TelegramMessage) => {
    const formattedMessage = formatMessage(message);
    await sendTelegramMessage(formattedMessage);
  },
};
