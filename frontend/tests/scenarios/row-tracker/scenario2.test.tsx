import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../../src/App';
import { mockPatternData, createMockFile } from '../../helpers/mockData';

/**
 * SCENARIO 2: Unmark a completed row
 * 
 * Acceptance Criteria:
 * - GIVEN I have a marked row
 * - WHEN I click on that row again
 * - THEN the row must return to its original state (unmarked)
 */
describe('Scenario 2: Unmark completed row', () => {
  
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPatternData),
        ok: true,
      } as Response)
    );
  });

  it('GIVEN: should have a marked row', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));

    expect(screen.getByTestId('pixel-cell-1-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-1-4')).toHaveClass('completed-row');
  });

  it('WHEN: clicking again on marked row THEN it must unmark', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    const cellRow2 = screen.getByTestId('pixel-cell-2-0');
    fireEvent.click(cellRow2);
    
    expect(cellRow2).toHaveClass('completed-row');

    fireEvent.click(cellRow2);

    expect(cellRow2).not.toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-4')).not.toHaveClass('completed-row');
  });

  it('AND: unmarking does not affect other marked rows', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));

    expect(screen.getByTestId('pixel-cell-0-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-1-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-0')).toHaveClass('completed-row');

    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));

    expect(screen.getByTestId('pixel-cell-1-0')).not.toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-0-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-0')).toHaveClass('completed-row');
  });
});
