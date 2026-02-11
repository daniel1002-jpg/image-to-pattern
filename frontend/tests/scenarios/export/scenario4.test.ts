import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

/**
 * Scenario 4: Watermark integration
 * 
 * Exported files should include a subtle watermark/branding string.
 */

describe('Scenario 4: Watermark integration', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let originalCreateElement: typeof document.createElement;

  const watermarkText = 'Image-to-Pattern';

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    globalThis.URL.revokeObjectURL = vi.fn();

    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not require UI controls to manage watermark', async () => {
    await setupInitialPattern(user);

    expect(screen.queryByText(watermarkText)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /watermark/i })).not.toBeInTheDocument();
  });
});
