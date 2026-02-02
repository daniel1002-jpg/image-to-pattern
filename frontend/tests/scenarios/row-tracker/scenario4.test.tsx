import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../../src/App';
import { mockPatternData, createMockFile } from '../../helpers/mockData';

/**
 * SCENARIO 4: Reset tracker
 * 
 * Acceptance Criteria:
 * - GIVEN I have marked rows
 * - WHEN I click on "Reset Progress" button
 * - THEN all rows must unmark
 * - AND counter must return to "0 of Y rows completed"
 */
describe('Scenario 4: Reset tracker', () => {
  
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPatternData),
        ok: true,
      } as Response)
    );
  });

  it('GIVEN: should have a "Reset Progress" button', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    expect(screen.getByRole('button', { name: /reset progress/i })).toBeInTheDocument();
  });

  it('WHEN: clicking reset THEN all marked rows must unmark', async () => {
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

    const resetButton = screen.getByRole('button', { name: /reset progress/i });
    fireEvent.click(resetButton);

    expect(screen.getByTestId('pixel-cell-0-0')).not.toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-1-0')).not.toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-0')).not.toHaveClass('completed-row');
  });

  it('AND: counter must return to "0 of Y rows completed"', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));

    expect(screen.getByText(/2 de 3 filas completadas/i)).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /reset progress/i });
    fireEvent.click(resetButton);

    expect(screen.getByText(/0 de 3 filas completadas/i)).toBeInTheDocument();
  });

  it('AND: button must work multiple times', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    const resetButton = screen.getByRole('button', { name: /reset progress/i });

    // Cycle 1
    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    expect(screen.getByText(/1 de 3 filas completadas/i)).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(screen.getByText(/0 de 3 filas completadas/i)).toBeInTheDocument();

    // Cycle 2
    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));
    expect(screen.getByText(/2 de 3 filas completadas/i)).toBeInTheDocument();
    fireEvent.click(resetButton);
    expect(screen.getByText(/0 de 3 filas completadas/i)).toBeInTheDocument();
  });
});
