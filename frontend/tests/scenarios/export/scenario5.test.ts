import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

/**
 * Scenario 5: Reasonable file size
 * 
 * Exports should remain within practical size limits for typical patterns.
 */

describe('Scenario 5: Reasonable file size', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let lastBlobSize = 0;
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

  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    lastBlobSize = 0;

    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      lastBlobSize = blob.size;
      return 'blob:mock-url';
    });

    global.URL.revokeObjectURL = vi.fn();

    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should keep PNG export under 500KB for typical patterns', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    expect(lastBlobSize).toBeGreaterThan(0);
    expect(lastBlobSize).toBeLessThan(500 * 1024);
  });

  it('should keep PDF export under 1MB for typical patterns', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(lastBlobSize).toBeGreaterThan(0);
    expect(lastBlobSize).toBeLessThan(1024 * 1024);
  });

  it('should keep PDF export under 1MB even with legend disabled', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const legendCheckbox = screen.getByRole('checkbox', { name: /include legend|legend/i });
    await user.click(legendCheckbox);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(lastBlobSize).toBeGreaterThan(0);
    expect(lastBlobSize).toBeLessThan(1024 * 1024);
  });
});
