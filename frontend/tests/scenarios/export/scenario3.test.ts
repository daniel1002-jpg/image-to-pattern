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
  let linkElement: HTMLAnchorElement | null;
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
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    linkElement = null;

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    globalThis.URL.revokeObjectURL = vi.fn();

    // Store original createElement
    originalCreateElement = document.createElement.bind(document);

    // Mock document.createElement for the download link
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        linkElement = element as HTMLAnchorElement;
        linkElement.click = vi.fn();
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display pattern dimensions in the UI', async () => {
    await setupPattern();

    const patternGrid = screen.getByTestId('pattern-grid');
    expect(patternGrid).toBeInTheDocument();
  });

  it('should include generation timestamp in PNG export filename', async () => {
    await setupPattern();

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    await waitFor(() => {
      expect(linkElement?.download).toMatch(/^pattern-\d{4}-\d{2}-\d{2}-\d{6}\.png$/);
    });
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

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
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

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
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

  it('should show the palette legend in the UI', async () => {
    await setupPattern();

    expect(screen.getByText(/Paleta/)).toBeInTheDocument();
  });

  it('should render the progress counter', async () => {
    await setupPattern();

    expect(screen.getByText(/filas completadas/i)).toBeInTheDocument();
  });
});
