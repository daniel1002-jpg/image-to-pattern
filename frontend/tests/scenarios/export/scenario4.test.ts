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
    await setupPattern();

    expect(screen.queryByText(watermarkText)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /watermark/i })).not.toBeInTheDocument();
  });
});
