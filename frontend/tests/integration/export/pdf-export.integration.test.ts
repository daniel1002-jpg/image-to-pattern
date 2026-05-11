import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

describe('Integration: PDF export output', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let capturedBlob: Blob | null = null;
  let originalCreateElement: typeof document.createElement;

  const readBlob = (blob: Blob) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    capturedBlob = null;

    globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    globalThis.URL.revokeObjectURL = vi.fn();

    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        (element as HTMLAnchorElement).click = vi.fn();
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports a PDF that embeds the pattern image', async () => {
    await setupInitialPattern(user);

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(capturedBlob).not.toBeNull();
    });

    const buffer = await readBlob(capturedBlob as Blob);
    const content = new TextDecoder('latin1').decode(buffer);

    expect(content.startsWith('%PDF-')).toBe(true);
    expect(content).toContain('/Subtype /Image');
  });
});
