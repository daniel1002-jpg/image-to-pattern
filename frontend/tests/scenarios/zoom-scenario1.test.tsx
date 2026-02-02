import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { mockPatternData } from '../helpers/mockData';

describe('Scenario 1: Zoom with mouse scroll (Ctrl+Scroll)', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should increase zoom when scrolling up with Ctrl pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando/i)).not.toBeInTheDocument();
    });

    const patternGrid = screen.getByTestId('pattern-grid');

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
      const zoomIndicator = screen.getByTestId('zoom-indicator');
      expect(zoomIndicator).toHaveTextContent(/11\d%/);
    });
  });

  it('should decrease zoom when scrolling down with Ctrl pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando/i)).not.toBeInTheDocument();
    });

    const patternGrid = screen.getByTestId('pattern-grid');

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
      const zoomIndicator = screen.getByTestId('zoom-indicator');
      expect(zoomIndicator).toHaveTextContent(/[5-9]\d%/);
    });
  });

  it('should respect zoom limits (50% min, 200% max)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando/i)).not.toBeInTheDocument();
    });

    const patternGrid = screen.getByTestId('pattern-grid');
    const zoomIndicator = screen.getByTestId('zoom-indicator');

    await act(async () => {
      for (let i = 0; i < 10; i++) {
        patternGrid.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: 100,
            ctrlKey: true,
            bubbles: true,
          })
        );
      }
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('50%');
    });

    await act(async () => {
      for (let i = 0; i < 30; i++) {
        patternGrid.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: -100,
            ctrlKey: true,
            bubbles: true,
          })
        );
      }
    });

    await waitFor(() => {
      expect(zoomIndicator).toHaveTextContent('200%');
    });
  });

  it('should not zoom when Ctrl is not pressed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando/i)).not.toBeInTheDocument();
    });

    const patternGrid = screen.getByTestId('pattern-grid');

    await act(async () => {
      patternGrid.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -100,
          ctrlKey: false,
          bubbles: true,
        })
      );
    });

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    expect(zoomIndicator).toHaveTextContent('100%');
  });
});