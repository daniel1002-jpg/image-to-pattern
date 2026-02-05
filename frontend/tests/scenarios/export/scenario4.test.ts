import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

/**
 * Scenario 4: Watermark integration
 * 
 * Exported files should include a subtle watermark/branding string.
 */

describe('Scenario 4: Watermark integration', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let downloadedContent = '';
  let originalCreateElement: typeof document.createElement;

  const watermarkText = 'Image-to-Pattern';

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
    downloadedContent = '';

    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        downloadedContent = reader.result as string;
      };
      reader.readAsText(blob);
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

  it('should include watermark text in PNG export metadata', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    expect(downloadedContent).toContain('watermark');
    expect(downloadedContent).toContain(watermarkText);
  });

  it('should include watermark text in PDF export content', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(downloadedContent).toContain(watermarkText);
  });

  it('should keep watermark in PDF even when legend is disabled', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const legendCheckbox = screen.getByRole('checkbox', { name: /include legend|legend/i });
    await user.click(legendCheckbox);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(downloadedContent).toContain(watermarkText);
  });

  it('should include watermark in PNG export even after multiple exports', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    expect(downloadedContent).toContain(watermarkText);

    await user.click(pngExportButton);
    expect(downloadedContent).toContain(watermarkText);
  });

  it('should not require UI controls to manage watermark', async () => {
    await setupPattern();

    expect(screen.queryByText(watermarkText)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /watermark/i })).not.toBeInTheDocument();
  });
});
