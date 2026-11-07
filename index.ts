import { CONFIG } from "./src/config.js";
import {date} from "./src/date.js";
import { gitUtils } from "./src/git-utils.js";
import { logMessage } from "./src/log.js";
import { telegram, type TelegramMessage } from "./src/telegram.js";
import {
  type DeleteResult,
  deleteUploads,
  getOlderUploads,
} from "./src/uploadcare.js";

async function main() {
  const oldFiles = await getOlderUploads(CONFIG.REMOVE_OLDER_THAN);

  if (oldFiles.length === 0) {
    await handleCleanup({
      title: "Uploadcare cleanup finished",
      emoji: "🧹",
      body: [`No files older than ${CONFIG.REMOVE_OLDER_THAN} days found.`],
    });
    return;
  }

  const deleteResult = await deleteUploads(oldFiles);
  const result = handleSuccessText(deleteResult, oldFiles);
  await handleCleanup(result);
}

main().catch(async (error) => {
  console.error("Fatal error in cleanup job:", error);
  try {
    await handleCleanup({
      title: "Uploadcare cleanup failed",
      emoji: "❌",
      body: [`Error: ${error.message || error}`],
    });
  } catch {
    // swallow secondary failure, the console.error above already captured it
  }
  process.exit(1);
});

function handleSuccessText(result: DeleteResult, oldFiles: any[]) {
  const totalSizeMb = (
    oldFiles.reduce((sum, f) => sum + (f.size || 0), 0) /
    (1024 * 1024)
  ).toFixed(2);

  const message = {
    title: "Uploadcare cleanup finished",
    emoji: "🧹",
    body: [
      `Found ${oldFiles.length} file(s) to remove, ~${totalSizeMb} MB total`,
      `Deleted: ${result.deletedCount}`,
    ],
  };

  if (result.failedUuids.length > 0) {
    message.body.push(`Failed: ${result.failedUuids.length}`);
    message.body.push(`Error: ${result.error}`);
  }

  return message;
}

/**
 * Cleanup flow handler: sends a Telegram message, logs the result, and commits & pushes the log to Git.
 * */
async function handleCleanup(resultMessage: TelegramMessage) {
  // Send a report to Telegram
  if (CONFIG.FLAGS.TELEGRAM) {
    await telegram.sendFormattedMsg(resultMessage);
  }

  // Log the result to a file
  if (CONFIG.FLAGS.LOG) {
    logMessage(resultMessage.title + ": " + resultMessage.body);
  }

  // Commit and push the log file to Git
  if (CONFIG.FLAGS.GIT) {
    const git = gitUtils(CONFIG.GIT_USER);
    git.commitAndPush(`add ${date.formatedDate} log`);
  }
}
