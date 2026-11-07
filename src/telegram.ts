import {CONFIG} from "./config.js";

// https://api.telegram.org/bot{CONFIG.TELEGRAM.BOT_TOKEN}/getUpdates

async function sendTelegramMessage(text: string): Promise<void> {
  if (!CONFIG.TELEGRAM.BOT_TOKEN || !CONFIG.TELEGRAM.CHAT_ID) {
    console.error('CONFIG.TELEGRAM.BOT_TOKEN or CONFIG.TELEGRAM.CHAT_ID is missing. Skipping message send.');
    return;
  }

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      chat_id: CONFIG.TELEGRAM.CHAT_ID,
      text,
      parse_mode: 'HTML',
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
function formatMessage(
  title: string,
  body: string | string[],
  emoji?: string
) {
  let msg = '';

  if (emoji) {
    msg += `${emoji} `;
  }

  msg += `<b>${title}</b>\n`;

  if (Array.isArray(body)) {
    msg += body.join('\n');
  } else {
    msg += body;
  }

  return msg;
}

export const telegram = {
  formatMsg: formatMessage,
  sendMsg: sendTelegramMessage,
}
