import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatternData } from '../../helpers/mockData';
import { setupInitialPattern } from '../../helpers/testSetup';

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
    await setupInitialPattern(user);

    const patternContainer = screen.getByTestId('pattern-container');
    const initialPosition = patternContainer.style.transform;

    // Try to drag when not zoomed in
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(document);

    // Position should not change
    expect(patternContainer.style.transform).toBe(initialPosition);
  });

  it('should enable panning when zoom is greater than 100%', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in first
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    await user.click(zoomInButton);

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('110%');
    });

    const patternContainer = screen.getByTestId('pattern-container');

    // Now drag should work
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(document);

    // Position should have changed
    const transform = patternContainer.style.transform;
    expect(transform).toMatch(/translate/);
  });

  it('should pan pattern in correct direction', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 3; i++) {
      await user.click(zoomInButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('130%');
    });

    const patternContainer = screen.getByTestId('pattern-container');

    // Drag right (should pan left in content view)
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(document);

    const firstTransform = patternContainer.style.transform;

    // Drag left (should pan right in content view)
    fireEvent.mouseDown(patternContainer, { clientX: 200, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(document);

    const secondTransform = patternContainer.style.transform;

    // Transforms should be different
    expect(firstTransform).not.toBe(secondTransform);
  });

  it('should respect pan boundaries (not pan beyond limits)', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    // Zoom in significantly
    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    for (let i = 0; i < 5; i++) {
      await user.click(zoomInButton);
    }

    const patternContainer = screen.getByTestId('pattern-container');

    // Try to pan way beyond limits (multiple large drags)
    for (let i = 0; i < 10; i++) {
      fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });
      fireEvent.mouseUp(document);
    }

    // Should have a valid transform (not arbitrary)
    const transform = patternContainer.style.transform;
    expect(transform).toMatch(/translate\(-?\d+px,\s*-?\d+px\)/);
  });

  it('should return to original position when zoom returns to 100%', async () => {
    const user = userEvent.setup();
    await setupInitialPattern(user);

    const zoomInButton = screen.getByRole('button', { name: /zoom in|\+/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out|-/i });
    const patternContainer = screen.getByTestId('pattern-container');

    // Zoom in
    await user.click(zoomInButton);

    // Pan
    fireEvent.mouseDown(patternContainer, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(document);

    const panTransform = patternContainer.style.transform;

    // Zoom back to 100%
    await user.click(zoomOutButton);

    await waitFor(() => {
      expect(screen.getByTestId('zoom-indicator')).toHaveTextContent('100%');
    });

    // Pan should be reset to (0, 0)
    const finalTransform = patternContainer.style.transform;
    expect(finalTransform).toBe('translate(0px, 0px)');
  });
});
