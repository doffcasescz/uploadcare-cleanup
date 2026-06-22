import {getOlderUploads, deleteUploads} from './src/uploadcare.js';
import {sendTelegramMessage} from './src/telegram.js';

const OLDER_THAN_DAYS = 30;

async function main() {
  const oldFiles = await getOlderUploads(OLDER_THAN_DAYS);

  if (oldFiles.length === 0) {
    await sendTelegramMessage(
      `🧹 <b>Uploadcare cleanup</b>\nNo files older than ${OLDER_THAN_DAYS} days found. Nothing to delete.`
    );
    return;
  }

  const result = await deleteUploads(oldFiles);

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

  await sendTelegramMessage(lines.join('\n'));
}

main().catch(async (error) => {
  console.error('Fatal error in cleanup job:', error);
  try {
    await sendTelegramMessage(
      `❌ <b>Uploadcare cleanup failed</b>\n${error instanceof Error ? error.message : String(error)}`
    );
  } catch {
    // swallow secondary failure, the console.error above already captured it
  }
  process.exit(1);
});
