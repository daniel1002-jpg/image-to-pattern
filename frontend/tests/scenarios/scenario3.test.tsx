import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/App';
import { mockLargePatternData, createMockFile } from '../helpers/mockData';

/**
 * SCENARIO 3: Progress indicator
 * 
 * Acceptance Criteria:
 * - GIVEN I have marked rows
 * - WHEN I view the pattern
 * - THEN I must see a counter showing "X of Y rows completed"
 */
describe('Scenario 3: Progress indicator', () => {
  
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockLargePatternData),
        ok: true,
      } as Response)
    );
  });

  it('GIVEN: should display initial counter "0 of Y rows completed"', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    expect(screen.getByText(/0 de 4 filas completadas/i)).toBeInTheDocument();
  });

  it('WHEN: marking rows THEN counter must update', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    expect(screen.getByText(/0 de 4 filas completadas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    expect(screen.getByText(/1 de 4 filas completadas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));
    expect(screen.getByText(/2 de 4 filas completadas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-3-0'));
    
    expect(screen.getByText(/4 de 4 filas completadas/i)).toBeInTheDocument();
  });

  it('AND: counter must decrement when unmarking rows', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));
    
    expect(screen.getByText(/3 de 4 filas completadas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('pixel-cell-1-0'));

    expect(screen.getByText(/2 de 4 filas completadas/i)).toBeInTheDocument();
  });

  it('AND: counter must reflect correct total of pattern rows', async () => {
    render(<App />);
    
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [createMockFile()] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    expect(screen.getByText(/de 4 filas completadas/i)).toBeInTheDocument();
  });
});
