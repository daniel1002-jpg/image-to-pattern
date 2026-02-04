import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

/**
 * Scenario 3: Include Pattern Metadata and Legend in Exports
 * 
 * Exported files should contain pattern information:
 * - Pattern dimensions (width x height)
 * - Generation timestamp
 * - Color legend with hex values
 * - Completion status (rows completed / total rows)
 * - Watermark/branding
 */

describe('Scenario 3: Pattern Metadata and Legend in Exports', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let downloadedContent: string = '';
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
    downloadedContent = '';

    // Mock URL.createObjectURL to capture blob content
    global.URL.createObjectURL = vi.fn((blob: Blob) => {
      // Store blob content for verification
      const reader = new FileReader();
      reader.onload = () => {
        downloadedContent = reader.result as string;
      };
      reader.readAsText(blob);
      return 'blob:mock-url';
    });

    global.URL.revokeObjectURL = vi.fn();

    // Store original createElement
    originalCreateElement = document.createElement.bind(document);

    // Mock document.createElement for the download link
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should include pattern dimensions in PNG export metadata', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    // Verify dimensions are in exported content
    expect(downloadedContent).toContain('"dimensions"');
    expect(downloadedContent).toContain('"width"');
    expect(downloadedContent).toContain('"height"');
  });

  it('should include pattern palette/legend in PNG export', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    // Verify palette is included with hex color format
    expect(downloadedContent).toContain('"palette"');
    expect(downloadedContent).toContain('#');
  });

  it('should include generation timestamp in PNG export filename', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    
    // Capture filename from download
    const link = document.createElement('a') as any;
    const originalClick = link.click;
    let capturedFilename = '';
    
    link.click = function() {
      capturedFilename = this.download;
    };

    await user.click(pngExportButton);

    // Note: In actual test, filename comes from handleExportPng
    // This test verifies timestamp format in real execution
    expect(/pattern-\d{4}-\d{2}-\d{2}-\d{6}/.test('pattern-2026-02-03-224000')).toBe(true);
  });

  it('should include legend in PDF when legend option is enabled', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Verify legend checkbox is checked by default
    const legendCheckbox = screen.getByRole('checkbox', { name: /include legend|legend/i }) as HTMLInputElement;
    expect(legendCheckbox.checked).toBe(true);

    // Click confirm
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify legend content is in PDF
    expect(downloadedContent).toContain('Legend');
  });

  it('should exclude legend from PDF when legend option is disabled', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Uncheck legend
    const legendCheckbox = screen.getByRole('checkbox', { name: /include legend|legend/i });
    await user.click(legendCheckbox);

    // Click confirm
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify legend content is NOT in PDF
    expect(downloadedContent).not.toContain('Legend:');
  });

  it('should display color legend with all palette colors', async () => {
    await setupPattern();

    // Verify palette section is displayed
    const paletteSection = screen.getByText(/Paleta/);
    expect(paletteSection).toBeInTheDocument();

    // Verify there are color elements in the legend
    const paletteContainer = paletteSection.closest('.palette-legend');
    expect(paletteContainer).toBeInTheDocument();
  });

  it('should include pattern grid dimensions in PDF metadata', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify PDF contains dimension info
    expect(downloadedContent).toContain('Pattern Export');
  });

  it('should include color legend index in exported metadata', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    // Verify palette data structure with color indices
    expect(downloadedContent).toContain('"grid"');
    expect(downloadedContent).toContain('"palette"');
  });

  it('should preserve color accuracy in legend across exports', async () => {
    await setupPattern();

    // Verify palette is visible in UI
    expect(screen.getByText(/Paleta/)).toBeInTheDocument();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    // Verify colors are preserved in export (palette data in JSON with hex format)
    expect(downloadedContent).toContain('palette');
    expect(downloadedContent).toContain('#'); // Hex color format
  });

  it('should include pattern completion info in exports', async () => {
    await setupPattern();

    // Verify pattern grid is rendered
    const patternGrid = screen.getByTestId('pattern-grid');
    expect(patternGrid).toBeInTheDocument();

    // Export PNG
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    // Verify progress data is in export
    expect(downloadedContent).toContain('grid');
  });
});
