import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../../src/App';
import { mockPatternData, createMockFile } from '../../helpers/mockData';

/**
 * SCENARIO 1: Mark a row as completed
 * 
 * Acceptance Criteria:
 * - GIVEN a generated pattern on screen
 * - WHEN I click on a row in the grid
 * - THEN the row must be visually highlighted
 * - AND the state must persist while in the session
 */
describe('Scenario 1: Mark row as completed', () => {
  
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPatternData),
        ok: true,
      } as Response)
    );
  });

  it('GIVEN: should display a generated pattern on screen', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });

    const generateButton = screen.getByText(/Generar Patrón/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Vista Previa/i)).toBeInTheDocument();
    });
    
    const pixels = screen.getAllByTestId(/^pixel-cell-\d+-\d+$/);
    expect(pixels.length).toBe(15);
  });

  it('WHEN: clicking on a row cell THEN the entire row must be marked', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    const firstCellRow1 = screen.getByTestId('pixel-cell-1-0');
    fireEvent.click(firstCellRow1);

    for (let col = 0; col < 5; col++) {
      const cell = screen.getByTestId(`pixel-cell-1-${col}`);
      expect(cell).toHaveClass('completed-row');
    }

    const cellRow0 = screen.getByTestId('pixel-cell-0-0');
    const cellRow2 = screen.getByTestId('pixel-cell-2-0');
    expect(cellRow0).not.toHaveClass('completed-row');
    expect(cellRow2).not.toHaveClass('completed-row');
  });

  it('AND: the state must persist (marking multiple rows)', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));

    expect(screen.getByTestId('pixel-cell-0-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-0-4')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-4')).toHaveClass('completed-row');
    
    expect(screen.getByTestId('pixel-cell-1-0')).not.toHaveClass('completed-row');
  });
});
