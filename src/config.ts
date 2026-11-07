import './dotenv.js'
import packageConfig from "../package.json" with {type: "json"}

// Retrieve some meta from package.json
const packageConfigName = packageConfig.name;
const author = packageConfig.author;

export const CONFIG = {
  BOT_NAME: packageConfigName,
  REMOVE_OLDER_THAN: parseInt(process.env.OLDER_THAN_DAYS || '30', 10), // days
  FLAGS: {
    TELEGRAM: true,
    LOG: true,
  },
  GIT_USER: {
    name: process.env.GIT_USER_NAME || author.name,
    email: process.env.GIT_USER_EMAIL || author.email,
  },
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    CHAT_ID: process.env.TELEGRAM_CHAT_ID
  },
  UPLOADCARE: {
    PUBLIC_KEY: process.env.UPLOADCARE_PUBLIC_KEY,
    SECRET_KEY: process.env.UPLOADCARE_SECRET_KEY,
  },
} as const
