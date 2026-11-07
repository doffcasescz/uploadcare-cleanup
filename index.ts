import {CONFIG} from "./src/config.js";
import {gitUtils} from "./src/git-utils.js";
import {logMessage} from "./src/log.js";
import {telegram} from './src/telegram.js';
import {type DeleteResult, deleteUploads, getOlderUploads} from './src/uploadcare.js';

async function main() {
  const oldFiles = await getOlderUploads(CONFIG.REMOVE_OLDER_THAN);

  if (oldFiles.length === 0) {
      await handleCleanup(
        telegram.formatMsg(
          'Uploadcare cleanup finished',
          `No files older than ${CONFIG.REMOVE_OLDER_THAN} days found. Nothing to delete.`,
          '🧹'
        )
      )
    return;
  }

  const deleteResult = await deleteUploads(oldFiles);
  const result = handleSuccessText(deleteResult, oldFiles);
  await handleCleanup(result)
}

main().catch(async (error) => {
  console.error('Fatal error in cleanup job:', error);
  try {
    await handleCleanup(
      telegram.formatMsg(
        'Uploadcare cleanup failed',
        error instanceof Error ? error.message : String(error),
        '❌'
      )
    );
  } catch {
    // swallow secondary failure, the console.error above already captured it
  }
  process.exit(1);
});


function handleSuccessText(result: DeleteResult, oldFiles: any[]) {
  const totalSizeMb = (
    oldFiles.reduce((sum, f) => sum + (f.size || 0), 0) / (1024 * 1024)
  ).toFixed(2);

  const lines = [
    `🧹 <b>Uploadcare cleanup</b>`,
    `Found ${oldFiles.length} file(s) to remove, ~${totalSizeMb} MB total`,
    `Deleted: ${result.deletedCount}`,
  ];

  if (result.failedUuids.length > 0) {
    lines.push(`Failed: ${result.failedUuids.length}`);
    lines.push(`Error: ${result.error}`);
  }

  return lines.join('\n');
}

/**
 * Cleanup flow handler: sends a Telegram message, logs the result, and commits & pushes the log to Git.
 * */
async function handleCleanup(resultMessage: string) {
  // Send a report to Telegram
  await telegram.sendMsg(resultMessage);

  // Log the result to a file
  logMessage(resultMessage)

  // Commit and push the log file to Git
  const git = gitUtils(CONFIG.GIT_USER);
  git.commitAndPush(`${new Date().toISOString()} Log`);
}
