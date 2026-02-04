/**
 * Generates a timestamp in format: YYYY-MM-DD-HHmmss
 * Used for export filenames to ensure uniqueness and preserve generation time
 */
export const getExportTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
};

/**
 * Triggers a file download by creating a blob and temporary link
 * Properly cleans up resources after download
 * 
 * @param blob - The file content as a Blob
 * @param filename - The desired filename for download
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
