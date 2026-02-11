import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';
import UPNG from 'upng-js';

describe('Integration: PNG export includes progress styling', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let capturedBlob: Blob | null = null;
  let originalCreateElement: typeof document.createElement;

  const readBlob = (blob: Blob) =>
    new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });

  const expectedCompletedColor = (r: number, g: number, b: number) => {
    const gray = Math.round(r * 0.3 + g * 0.59 + b * 0.11);
    const mixedR = Math.round((r + gray) / 2);
    const mixedG = Math.round((g + gray) / 2);
    const mixedB = Math.round((b + gray) / 2);

    const finalR = Math.round((mixedR + 255) / 2);
    const finalG = Math.round((mixedG + 255) / 2);
    const finalB = Math.round((mixedB + 255) / 2);

    return [finalR, finalG, finalB];
  };

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
    capturedBlob = null;

    (globalThis as any).URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    (globalThis as any).URL.revokeObjectURL = vi.fn();

    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        (element as HTMLAnchorElement).click = vi.fn();
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dims completed rows in the exported PNG', async () => {
    await setupInitialPattern(user);

    const firstCell = await screen.findByTestId('pixel-cell-0-0');
    await user.click(firstCell);

    const pngExportButton = await screen.findByRole('button', { name: /export.*png/i });
    await user.click(pngExportButton);

    await waitFor(() => {
      expect(capturedBlob).not.toBeNull();
    });

    const buffer = await readBlob(capturedBlob as Blob);
    const decoded = UPNG.decode(buffer);
    const rgbaBuffers = UPNG.toRGBA8(decoded);
    const rgba = new Uint8Array(rgbaBuffers[0]);

    const r = rgba[0];
    const g = rgba[1];
    const b = rgba[2];

    const [expectedR, expectedG, expectedB] = expectedCompletedColor(255, 0, 0);

    expect(r).toBe(expectedR);
    expect(g).toBe(expectedG);
    expect(b).toBe(expectedB);
  });
});
