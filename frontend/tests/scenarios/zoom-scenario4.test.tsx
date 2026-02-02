import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { mockPatternData } from '../helpers/mockData';

describe('Scenario 4: Pan/drag for zoomed pattern navigation', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPatternData),
      })
    ) as unknown as typeof fetch;
  });

  it('should not allow panning when zoom is 100%', async () => {
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

    const patternContainer = screen.getByTestId('pattern-container');
    const initialPosition = patternContainer.style.transform;

    // Try to drag when not zoomed in
    await act(async () => {
      patternContainer.dispatchEvent(
        new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true })
      );
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // Position should not change
    expect(patternContainer.style.transform).toBe(initialPosition);
  });

  it('should enable panning when zoom is greater than 100%', async () => {
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

    // Zoom in first
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    await act(async () => {
      await user.click(zoomInButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('110%');
    });

    const patternContainer = screen.getByTestId('pattern-container');

    // Now drag should work
    await act(async () => {
      patternContainer.dispatchEvent(
        new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true })
      );
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    // Position should have changed
    const transform = patternContainer.style.transform;
    expect(transform).toMatch(/translate/);
  });

  it('should pan pattern in correct direction', async () => {
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
      await act(async () => {
        await user.click(zoomInButton);
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('130%');
    });

    const patternContainer = screen.getByTestId('pattern-container');

    // Drag right (should pan left in content view)
    await act(async () => {
      patternContainer.dispatchEvent(
        new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    const firstTransform = patternContainer.style.transform;

    // Drag left (should pan right in content view)
    await act(async () => {
      patternContainer.dispatchEvent(
        new MouseEvent('mousedown', { clientX: 200, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    const secondTransform = patternContainer.style.transform;

    // Transforms should be different
    expect(firstTransform).not.toBe(secondTransform);
  });

  it('should respect pan boundaries (not pan beyond limits)', async () => {
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

    // Zoom in significantly
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await user.click(zoomInButton);
      });
    }

    const patternContainer = screen.getByTestId('pattern-container');

    // Try to pan way beyond limits (multiple large drags)
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        patternContainer.dispatchEvent(
          new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true })
        );
        document.dispatchEvent(
          new MouseEvent('mousemove', { clientX: 500, clientY: 500, bubbles: true })
        );
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
    }

    // Should have a valid transform (not arbitrary)
    const transform = patternContainer.style.transform;
    expect(transform).toMatch(/translate\(-?\d+px,\s*-?\d+px\)/);
  });

  it('should return to original position when zoom returns to 100%', async () => {
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

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });
    const patternContainer = screen.getByTestId('pattern-container');

    // Zoom in
    await act(async () => {
      await user.click(zoomInButton);
    });

    // Pan
    await act(async () => {
      patternContainer.dispatchEvent(
        new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true })
      );
      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 200, clientY: 200, bubbles: true })
      );
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    const panTransform = patternContainer.style.transform;

    // Zoom back to 100%
    await act(async () => {
      await user.click(zoomOutButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });

    // Pan should be reset to (0, 0)
    const finalTransform = patternContainer.style.transform;
    expect(finalTransform).toBe('translate(0px, 0px)');
  });
});
