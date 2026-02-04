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

/**
 * Generates a PDF blob from pattern data
 * Minimal implementation for testing - creates a simple PDF
 * 
 * @param data - Pattern data to include
 * @param options - Export options (pageSize, includeLegend)
 * @returns Promise<Blob> containing the PDF
 */
export const generatePdfBlob = async (
  data: any,
  options: { pageSize: string; includeLegend: boolean }
): Promise<Blob> => {
  // Simple implementation: create a minimal PDF
  // For production, would use jsPDF with proper formatting
  const legendLine = options.includeLegend ? ` - Legend: ${options.includeLegend}` : '';
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
100 700 Td
(Pattern Export - ${options.pageSize}${legendLine}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000246 00000 n 
0000000333 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
481
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
};

