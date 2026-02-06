import { jsPDF } from 'jspdf';

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

export const WATERMARK_TEXT = 'Image-to-Pattern';

export interface PatternData {
  status: string;
  dimensions: {
    width: number;
    height: number;
  };
  palette: string[];
  grid: number[][];
}

const DEFAULT_PIXEL_SIZE = 10;

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const applyCompletedRowStyle = (r: number, g: number, b: number): [number, number, number] => {
  const gray = Math.round(r * 0.3 + g * 0.59 + b * 0.11);
  const mixedR = Math.round((r + gray) / 2);
  const mixedG = Math.round((g + gray) / 2);
  const mixedB = Math.round((b + gray) / 2);

  const finalR = Math.round((mixedR + 255) / 2);
  const finalG = Math.round((mixedG + 255) / 2);
  const finalB = Math.round((mixedB + 255) / 2);

  return [finalR, finalG, finalB];
};

const createCrcTable = (): Uint32Array => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
};

const CRC_TABLE = createCrcTable();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const buildTextChunk = (keyword: string, text: string): Uint8Array => {
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);
  const data = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  data.set(keywordBytes, 0);
  data[keywordBytes.length] = 0;
  data.set(textBytes, keywordBytes.length + 1);

  const length = data.length;
  const chunk = new Uint8Array(12 + length);

  chunk[0] = (length >>> 24) & 0xff;
  chunk[1] = (length >>> 16) & 0xff;
  chunk[2] = (length >>> 8) & 0xff;
  chunk[3] = length & 0xff;

  chunk.set([0x74, 0x45, 0x58, 0x74], 4); // tEXt
  chunk.set(data, 8);

  const crcInput = new Uint8Array(4 + data.length);
  crcInput.set(chunk.slice(4, 8), 0);
  crcInput.set(data, 4);
  const crc = crc32(crcInput);
  const crcOffset = 8 + data.length;
  chunk[crcOffset] = (crc >>> 24) & 0xff;
  chunk[crcOffset + 1] = (crc >>> 16) & 0xff;
  chunk[crcOffset + 2] = (crc >>> 8) & 0xff;
  chunk[crcOffset + 3] = crc & 0xff;

  return chunk;
};

const insertTextChunks = (png: Uint8Array, chunks: Uint8Array[]): Uint8Array => {
  const signatureLength = 8;
  let offset = signatureLength;
  const ihdrLength =
    (png[offset] << 24) |
    (png[offset + 1] << 16) |
    (png[offset + 2] << 8) |
    png[offset + 3];
  const ihdrTotal = 12 + ihdrLength;
  const insertOffset = signatureLength + ihdrTotal;

  const chunksLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(png.length + chunksLength);

  output.set(png.slice(0, insertOffset), 0);
  let cursor = insertOffset;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  output.set(png.slice(insertOffset), cursor);

  return output;
};

const buildPatternRgba = (
  pattern: PatternData,
  completedRows: Set<number>
): { rgba: Uint8Array; width: number; height: number } => {
  const pixelSize = DEFAULT_PIXEL_SIZE;
  const width = pattern.dimensions.width * pixelSize;
  const height = pattern.dimensions.height * pixelSize;
  const rgba = new Uint8Array(width * height * 4);

  rgba.fill(255);

  for (let row = 0; row < pattern.grid.length; row += 1) {
    const rowData = pattern.grid[row];
    for (let col = 0; col < rowData.length; col += 1) {
      const color = pattern.palette[rowData[col]];
      let [r, g, b] = hexToRgb(color);
      if (completedRows.has(row)) {
        [r, g, b] = applyCompletedRowStyle(r, g, b);
      }
      const startX = col * pixelSize;
      const startY = row * pixelSize;
      for (let y = 0; y < pixelSize; y += 1) {
        const pixelY = startY + y;
        for (let x = 0; x < pixelSize; x += 1) {
          const pixelX = startX + x;
          const idx = (pixelY * width + pixelX) * 4;
          rgba[idx] = r;
          rgba[idx + 1] = g;
          rgba[idx + 2] = b;
          rgba[idx + 3] = 255;
        }
      }
    }
  }

  return { rgba, width, height };
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const buildPatternPngBytes = async (
  pattern: PatternData,
  completedRows: Set<number>
): Promise<Uint8Array> => {
  const { rgba, width, height } = buildPatternRgba(pattern, completedRows);
  const { default: UPNG } = await import('upng-js');
  const pngArrayBuffer = UPNG.encode([rgba.buffer as ArrayBuffer], width, height, 0);
  return new Uint8Array(pngArrayBuffer);
};

const buildExportMetadata = (pattern: PatternData) => ({
  ...pattern,
  watermark: WATERMARK_TEXT,
});

export const generatePngBlob = async (
  pattern: PatternData,
  completedRows: Set<number> = new Set()
): Promise<Blob> => {
  const pngBytes = await buildPatternPngBytes(pattern, completedRows);

  const metadata = JSON.stringify(buildExportMetadata(pattern));
  const textChunks = [
    buildTextChunk('metadata', metadata),
    buildTextChunk('watermark', WATERMARK_TEXT),
  ];
  const withText = insertTextChunks(pngBytes, textChunks);

  const pngBuffer = withText.buffer.slice(
    withText.byteOffset,
    withText.byteOffset + withText.byteLength
  ) as ArrayBuffer;
  // Ensure we pass a Uint8Array to Blob to avoid SharedArrayBuffer issues
  return new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' });
};

/**
 * Generates a PDF blob from pattern data
 * Embeds a PNG render of the pattern for visual export.
 * 
 * @param data - Pattern data to include
 * @param options - Export options (pageSize, includeLegend)
 * @returns Promise<Blob> containing the PDF
 */
export const generatePdfBlob = async (
  data: PatternData,
  options: { pageSize: string; includeLegend: boolean },
  completedRows: Set<number> = new Set()
): Promise<Blob> => {
  const pdf = new jsPDF({
    format: options.pageSize.toLowerCase() as 'a4' | 'letter' | 'a3',
    unit: 'pt',
  });

  const pngBytes = await buildPatternPngBytes(data, completedRows);
  const base64 = bytesToBase64(pngBytes);
  const dataUrl = `data:image/png;base64,${base64}`;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const padding = 40;
  const imageWidth = pageWidth - padding * 2;
  const imageHeight = imageWidth * (data.dimensions.height / data.dimensions.width);

  pdf.addImage(dataUrl, 'PNG', padding, padding, imageWidth, imageHeight);

  pdf.setFontSize(10);
  const legendText = options.includeLegend ? 'Legend: true' : 'Legend: false';
  pdf.text(`Pattern Export - ${options.pageSize} - ${legendText}`, padding, pageHeight - 40);
  pdf.text(`Watermark: ${WATERMARK_TEXT}`, padding, pageHeight - 25);

  const pdfArrayBuffer = pdf.output('arraybuffer');
  return new Blob([pdfArrayBuffer], { type: 'application/pdf' });
};

