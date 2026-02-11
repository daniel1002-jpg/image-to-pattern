import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

/**
 * Scenario 1: Export PNG
 * 
 * User should be able to export the generated pattern as a PNG file
 * with timestamp in filename and pattern visible in the exported image.
 */

describe('Scenario 1: Export PNG', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let linkElement: HTMLAnchorElement | null;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    linkElement = null;
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
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

  it('should display PNG export button after pattern generation', async () => {
    await setupInitialPattern(user);
    
    // Wait for pattern to be generated and PNG export button to appear
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    expect(pngExportButton).toBeInTheDocument();
  });

  it('should trigger PNG download with correct filename format', async () => {
    await setupInitialPattern(user);
    
    // Click PNG export button
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);
    
    await waitFor(() => {
      expect(linkElement?.download).toMatch(/^pattern-\d{4}-\d{2}-\d{2}-\d{6}\.png$/);
    });
  });

  it('should use blob URL for PNG download', async () => {
    await setupInitialPattern(user);
    
    // Click PNG export button
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);
    
    // Verify blob URL was created and used
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(linkElement?.href).toBe('blob:mock-url');
  });

  it('should trigger link click to download PNG', async () => {
    await setupInitialPattern(user);
    
    // Click PNG export button
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);
    
    // Verify link.click() was called to trigger download
    expect(linkElement?.click).toHaveBeenCalled();
  });

  it('should revoke blob URL after download', async () => {
    await setupInitialPattern(user);
    
    // Click PNG export button
    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);
    
    // Verify blob URL was revoked to free memory
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should trigger PNG export after pattern is generated', async () => {
    await setupInitialPattern(user);

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    expect(linkElement?.download).toBeTruthy();
  });
});
