import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import { mockPatternData } from '../../helpers/mockData';

describe('Scenario 6: Auto-reset zoom on new pattern', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should reset zoom to 100% when generating a new pattern', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Zoom in to 170%
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 7; i++) {
      await user.click(zoomInButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('170%');
    });

    // Upload a new file and generate new pattern
    const newFile = new File(['dummy2'], 'test2.png', { type: 'image/png' });
    await user.upload(input, newFile);

    // Generate new pattern
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Zoom should be reset to 100%
    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });
  });

  it('should reset pan to 0,0 when generating new pattern', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 3; i++) {
      await user.click(zoomInButton);
    }

    // Pan the pattern
    let patternContainer = screen.getByTestId('pattern-container');
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 250, clientY: 250 });
    fireEvent.mouseUp(document);

    const panTransform = patternContainer.style.transform;
    expect(panTransform).toMatch(/translate\(-?\d+px,\s*-?\d+px\)/);

    // Upload new file and generate
    const newFile = new File(['dummy2'], 'test2.png', { type: 'image/png' });
    await user.upload(input, newFile);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Get fresh reference to pattern container after new pattern is rendered
    patternContainer = screen.getByTestId('pattern-container');

    // Pan should be reset
    expect(patternContainer.style.transform).toBe('translate(0px, 0px)');
  });

  it('should reset row progress when generating new pattern', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Mark some rows as completed
    const firstCell = screen.getByTestId('pixel-cell-0-0');
    await user.click(firstCell);

    // Check progress shows
    await waitFor(() => {
      const progressText = screen.getByText(/\d+ de \d+ filas/i);
      expect(progressText).toBeInTheDocument();
    });

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 5; i++) {
      await user.click(zoomInButton);
    }

    // Generate new pattern (zoom and pan should reset)
    const newFile = new File(['dummy2'], 'test2.png', { type: 'image/png' });
    await user.upload(input, newFile);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Zoom should be 100%
    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });

    // But progress should be reset for new pattern (0 de X filas)
    const progressText = screen.getByText(/0 de \d+ filas/i);
    expect(progressText).toBeInTheDocument();
  });

  it('should handle rapid zoom changes before generating new pattern', async () => {
    const user = userEvent.setup();
    render(<App />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const input = screen.getByTitle('file');
    await user.upload(input, file);

    const generateButton = screen.getByRole('button', { name: /generar patrón/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Rapidly zoom in and out
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });

    for (let i = 0; i < 3; i++) {
      await user.click(zoomInButton);
    }

    for (let i = 0; i < 2; i++) {
      await user.click(zoomOutButton);
    }

    // Should be at 110%
    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('110%');
    });

    // Generate new pattern
    const newFile = new File(['dummy2'], 'test2.png', { type: 'image/png' });
    await user.upload(input, newFile);
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.queryByText(/generando|tejiendo/i)).not.toBeInTheDocument();
    });

    // Should reset to 100% regardless of previous state
    expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
  });
});
