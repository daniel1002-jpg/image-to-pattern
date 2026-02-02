import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { mockPatternData } from '../helpers/mockData';

describe('Scenario 2: Zoom in/out buttons', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should increase zoom when clicking zoom in button', async () => {
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

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });

    await act(async () => {
      await user.click(zoomInButton);
    });

    await waitFor(() => {
      const zoomIndicator = screen.getByTestId('zoom-indicator');
      expect(zoomIndicator).toHaveTextContent('110%');
    });
  });

  it('should decrease zoom when clicking zoom out button', async () => {
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

    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });

    await act(async () => {
      await user.click(zoomOutButton);
    });

    await waitFor(() => {
      const zoomIndicator = screen.getByTestId('zoom-indicator');
      expect(zoomIndicator).toHaveTextContent('90%');
    });
  });

  it('should disable zoom in button at max zoom (200%)', async () => {
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

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });

    // Click 11 times to reach 200% (100 + 10*11 = 210, but capped at 200)
    await act(async () => {
      for (let i = 0; i < 11; i++) {
        await user.click(zoomInButton);
      }
    });

    await waitFor(() => {
      expect(zoomInButton).toBeDisabled();
    });

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    expect(zoomIndicator).toHaveTextContent('200%');
  });

  it('should disable zoom out button at min zoom (50%)', async () => {
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

    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });

    // Click 5 times to reach 50% (100 - 10*5 = 50)
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await user.click(zoomOutButton);
      }
    });

    await waitFor(() => {
      expect(zoomOutButton).toBeDisabled();
    });

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    expect(zoomIndicator).toHaveTextContent('50%');
  });

  it('should enable buttons when moving away from limits', async () => {
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

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });

    // Reach max (200%)
    await act(async () => {
      for (let i = 0; i < 11; i++) {
        await user.click(zoomInButton);
      }
    });

    await waitFor(() => {
      expect(zoomInButton).toBeDisabled();
      expect(zoomOutButton).not.toBeDisabled();
    });

    // Click zoom out once to leave max
    await act(async () => {
      await user.click(zoomOutButton);
    });

    await waitFor(() => {
      expect(zoomInButton).not.toBeDisabled();
    });

    const zoomIndicator = screen.getByTestId('zoom-indicator');
    expect(zoomIndicator).toHaveTextContent('190%');
  });
});
