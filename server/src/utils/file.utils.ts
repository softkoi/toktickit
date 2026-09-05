import fs from 'fs';

/**
 * Safely removes a file asynchronously without throwing unhandled exceptions.
 * Logs an error if unlinking fails (excluding standard missing file errors if needed).
 */
export const safeUnlink = async (filePath?: string): Promise<void> => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (err: any) {
    console.error(`Failed to clean up temp file at ${filePath}:`, err);
  }
};
