import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

/**
 * Scenario 2: Export PDF
 * 
 * User should be able to export the pattern as a PDF with options modal
 * allowing customization of page size, legend inclusion, and export scale.
 */

describe('Scenario 2: Export PDF', () => {
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
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    linkElement = null;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

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

  it('should display PDF export button after pattern generation', async () => {
    await setupPattern();

    // Wait for pattern to be generated and PDF export button to appear
    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    expect(pdfExportButton).toBeInTheDocument();
  });

  it('should open options modal when clicking PDF export button', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Modal should be visible with title
    const modal = await screen.findByRole('dialog', { hidden: false });
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/pdf export options/i)).toBeInTheDocument();
  });

  it('should allow selection of page size in modal', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Find page size options
    const pageSizeRadios = screen.getAllByRole('radio', { name: /a4|letter/i });
    expect(pageSizeRadios.length).toBeGreaterThanOrEqual(2);

    // A4 should be selected by default
    const a4Radio = screen.getByRole('radio', { name: /a4/i }) as HTMLInputElement;
    expect(a4Radio.checked).toBe(true);
  });

  it('should allow toggling legend inclusion', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Find legend checkbox
    const legendCheckbox = screen.getByRole('checkbox', { name: /include legend|legend/i }) as HTMLInputElement;
    expect(legendCheckbox).toBeInTheDocument();

    // Should be checked by default
    expect(legendCheckbox.checked).toBe(true);

    // Toggle it off
    await user.click(legendCheckbox);
    expect(legendCheckbox.checked).toBe(false);
  });

  it('should trigger PDF download with correct filename when confirming modal', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Click confirm/export button in modal
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify download was triggered with correct filename format
    // Filename should be: pattern-YYYY-MM-DD-HHmmss.pdf
    expect(linkElement?.download).toMatch(/^pattern-\d{4}-\d{2}-\d{2}-\d{6}\.pdf$/);
  });

  it('should use blob URL for PDF download', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify blob URL was created and used
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(linkElement?.href).toBe('blob:mock-url');
  });

  it('should revoke blob URL after PDF download', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify blob URL was revoked to free memory
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should close modal after successful PDF export', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Modal should be open
    let modal: HTMLElement | null = screen.getByRole('dialog', { hidden: false });
    expect(modal).toBeInTheDocument();

    // Click confirm
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Modal should be closed or removed
    modal = screen.queryByRole('dialog', { hidden: false });
    expect(modal).not.toBeInTheDocument();
  });

  it('should respect selected page size option in PDF', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Select Letter size instead of A4
    const letterRadio = screen.getByRole('radio', { name: /letter/i });
    await user.click(letterRadio);

    // Click confirm
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Verify export was called (we'll verify content in integration tests)
    expect(linkElement?.download).toMatch(/\.pdf$/);
  });

  it('should allow canceling PDF export without downloading', async () => {
    await setupPattern();

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel|close/i });
    await user.click(cancelButton);

    // Modal should be closed
    const modal = screen.queryByRole('dialog', { hidden: false });
    expect(modal).not.toBeInTheDocument();

    // Download should not have been triggered
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });
});
