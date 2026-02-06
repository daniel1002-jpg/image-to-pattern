import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

describe('Integration: PDF export output', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let capturedBlob: Blob | null = null;
  let originalCreateElement: typeof document.createElement;

  const setupPattern = async () => {
    render(React.createElement(App));
    const fileInput = screen.getByTitle('file') as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    const file = new File(['mock'], 'test.png', { type: 'image/png' });

    await user.upload(fileInput, file);
    await waitFor(() => expect(generateButton).toBeEnabled());
    await user.click(generateButton);
  };

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
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports a PDF that embeds the pattern image', async () => {
    await setupPattern();

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
