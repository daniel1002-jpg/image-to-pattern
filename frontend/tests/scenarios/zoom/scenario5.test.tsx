import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

describe('Scenario 5: Reset zoom to 100%', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should have a reset button when zoom is not 100%', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // At 100% zoom, reset button should not be visible or be disabled
    let resetButton = screen.queryByRole('button', { name: /reset.*zoom|zoom.*reset/i });
    if (resetButton) {
      expect(resetButton).toBeDisabled();
    }

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    await user.click(zoomInButton);

    // Now reset button should be visible and enabled
    resetButton = screen.getByRole('button', { name: /reset.*zoom|zoom.*reset/i });
    expect(resetButton).not.toBeDisabled();
  });

  it('should reset zoom to 100% when clicking reset button', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in to 150%
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 5; i++) {
      await user.click(zoomInButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('150%');
    });

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset.*zoom|zoom.*reset/i });
    await user.click(resetButton);

    // Zoom should be back to 100%
    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });
  });

  it('should reset zoom on double-click of pattern grid', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in to 140%
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 4; i++) {
      await user.click(zoomInButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('140%');
    });

    // Double-click pattern grid
    const patternGrid = screen.getByTestId('pattern-grid');
    await user.dblClick(patternGrid);

    // Zoom should be back to 100%
    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });
  });

  it('should also reset pan when resetting zoom', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 3; i++) {
      await user.click(zoomInButton);
    }

    // Pan the pattern
    const patternContainer = screen.getByTestId('pattern-container');
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(document);

    const panTransform = patternContainer.style.transform;
    // Should have panned
    expect(panTransform).toMatch(/translate\(-?\d+px,\s*-?\d+px\)/);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset.*zoom|zoom.*reset/i });
    await user.click(resetButton);

    // Pan should be reset to (0, 0)
    await waitFor(() => {
      const finalTransform = patternContainer.style.transform;
      expect(finalTransform).toBe('translate(0px, 0px)');
    });
  });
});
