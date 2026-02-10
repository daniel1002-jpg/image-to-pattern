import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

/**
 * Scenario 1: Size Calculator
 * 
 * Users can enter the square size in cm to estimate final pattern size.
 */

describe('Scenario 1: Size Calculator', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show the size calculator after pattern generation', async () => {
    await setupInitialPattern(user);

    expect(screen.getByLabelText(/tamaño del cuadrado \(cm\)/i)).toBeInTheDocument();
    expect(screen.getByText(/tamaño estimado/i)).toBeInTheDocument();
  });

  it('should update the estimated size when the square size changes', async () => {
    await setupInitialPattern(user);

    const input = screen.getByLabelText(/tamaño del cuadrado \(cm\)/i) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '2');

    expect(screen.getByText(/10\s*cm\s*x\s*6\s*cm/i)).toBeInTheDocument();
  });
});
