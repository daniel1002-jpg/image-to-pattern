import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

// Enable vitest globals
declare global {
  var URL: typeof globalThis.URL;
}

/**
 * Scenario 5: Reasonable file size
 * 
 * Exports should remain within practical size limits for typical patterns.
 */

describe('Scenario 5: Reasonable file size', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let lastBlobSize = 0;
  let originalCreateElement: typeof document.createElement;
  let linkElement: HTMLAnchorElement | null;

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    lastBlobSize = 0;
    linkElement = null;

    globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
      lastBlobSize = blob.size;
      return 'blob:mock-url';
    });

    globalThis.URL.revokeObjectURL = vi.fn();

    originalCreateElement = document.createElement.bind(document);
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

  it('should keep PNG export under 500KB for typical patterns', async () => {
    await setupInitialPattern(user);

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    await waitFor(() => {
      expect(lastBlobSize).toBeGreaterThan(0);
    });
    expect(lastBlobSize).toBeLessThan(500 * 1024);
  });

  it('should keep PDF export under 1MB for typical patterns', async () => {
    await setupInitialPattern(user);

    const pdfExportButton = await screen.findByRole('button', { name: /export.*pdf/i });
    await user.click(pdfExportButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(lastBlobSize).toBeGreaterThan(0);
    expect(lastBlobSize).toBeLessThan(1024 * 1024);
  });

  it('should keep PDF export under 1MB even with legend disabled', async () => {
    await setupInitialPattern(user);

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
