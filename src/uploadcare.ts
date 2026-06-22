import {
  type FileInfo,
  listOfFiles,
  deleteFiles,
  UploadcareSimpleAuthSchema,
} from '@uploadcare/rest-client';
import {configDotenv} from 'dotenv';

configDotenv();

const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '',
  secretKey: process.env.UPLOADCARE_SECRET_KEY || '',
});

function olderThan(days: number = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// TODO: paginate (using `uploads.next`) if the account has more than 1000 files total
export async function getOlderUploads(olderThanDays: number = 30): Promise<FileInfo[]> {
  const limit = 1000;
  const cutoff = olderThan(olderThanDays);

  const uploads = await listOfFiles(
    {
      limit,
      ordering: '-datetime_uploaded',
    },
    {authSchema: uploadcareSimpleAuthSchema}
  );

  console.info('Total files on account:', uploads.total);
  if (uploads.total < 1) return [];

  const oldFiles = uploads.results.filter(
    (upload) => new Date(upload.datetimeUploaded) < cutoff
  );

  console.info(`${oldFiles.length} file(s) older than ${olderThanDays} days found.`);
  return oldFiles;
}

export interface DeleteResult {
  deletedCount: number;
  failedUuids: string[];
  error?: string | undefined;
}

export async function deleteUploads(files: FileInfo[]): Promise<DeleteResult> {
  if (files.length === 0) {
    return {deletedCount: 0, failedUuids: []};
  }

  const uuids = files.map((file) => file.uuid);
  console.info(`Deleting ${uuids.length} file(s)...`);

  // Uploadcare's batch delete endpoint accepts up to 100 uuids per request
  const chunks: string[][] = [];
  for (let i = 0; i < uuids.length; i += 100) {
    chunks.push(uuids.slice(i, i + 100));
  }

  const failedUuids: string[] = [];
  let lastError: string | undefined;

  // sequential + awaited, so the function doesn't resolve before deletes finish
  for (const chunk of chunks) {
    try {
      await deleteFiles({uuids: chunk}, {authSchema: uploadcareSimpleAuthSchema});
      console.info(`Deleted ${chunk.length} file(s): ${chunk.join(', ')}`);
    } catch (error) {
      failedUuids.push(...chunk);
      lastError = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(`Error deleting files: ${chunk.join(', ')}`, error);
    }
  }

  return {
    deletedCount: uuids.length - failedUuids.length,
    failedUuids,
    error: lastError,
  };
}
