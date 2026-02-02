import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

describe('Scenario 3: Zoom level indicator', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should display initial zoom level of 100%', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    expect(zoomIndicator).toHaveTextContent('100%');
  });

  it('should update indicator in real-time when using scroll', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const patternGrid = screen.getByTestId('pattern-grid');
    const zoomIndicator = screen.getByTestId('zoom-indicator');

    // Initial state
    expect(zoomIndicator).toHaveTextContent('100%');

    // Scroll up (zoom in)
    await act(async () => {
      patternGrid.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          ctrlKey: true,
          bubbles: true,
        })
      );
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('110%');
    });

    // Scroll down (zoom out)
    await act(async () => {
      patternGrid.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 100,
          ctrlKey: true,
          bubbles: true,
        })
      );
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('100%');
    });
  });

  it('should update indicator in real-time when using buttons', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });
    const zoomIndicator = screen.getByTestId('zoom-indicator');

    // Initial state
    expect(zoomIndicator).toHaveTextContent('100%');

    // Click zoom in
    await act(async () => {
      await user.click(zoomInButton);
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('110%');
    });

    // Click zoom in again
    await act(async () => {
      await user.click(zoomInButton);
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('120%');
    });

    // Click zoom out
    await act(async () => {
      await user.click(zoomOutButton);
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('110%');
    });
  });

  it('should display exact zoom percentage at various levels', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomIndicator = screen.getByTestId('zoom-indicator');

    const testCases = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

    for (let i = 1; i < testCases.length; i++) {
      const expectedZoom = testCases[i];

      await act(async () => {
        await user.click(zoomInButton);
      });

      await waitFor(() => {
        expect(zoomIndicator).toHaveTextContent(`${expectedZoom}%`);
      });
    }
  });

  it('should show indicator updates are smooth (CSS transition)', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const patternGrid = screen.getByTestId('pattern-grid');

    // Verify grid has smooth transition
    const computedStyle = window.getComputedStyle(patternGrid);
    expect(computedStyle.transition).toContain('0.2s');

    // Verify indicator updates smoothly during multiple rapid zooms
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        patternGrid.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: -100,
            ctrlKey: true,
            bubbles: true,
          })
        );
      }
    });

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('150%');
    });
  });
});
