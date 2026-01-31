import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

/**
 * TESTS PARA ESCENARIO 1: Marcar una fila como completada
 * 
 * Issue #1 - Criterios de aceptación:
 * - DADO que tengo un patrón generado en pantalla
 * - CUANDO hago click en una fila de la grilla
 * - ENTONCES la fila debe resaltarse visualmente
 * - Y el estado debe persistir mientras esté en la sesión
 */
describe('Escenario 1: Marcar una fila como completada', () => {
  
  // Mock de datos del patrón (simula respuesta del backend)
  const mockPatternData = {
    status: 'success',
    dimensions: { width: 5, height: 3 },
    palette: ['#FF0000', '#00FF00', '#0000FF'],
    grid: [
      [0, 1, 2, 0, 1],  // Fila 0
      [1, 2, 0, 1, 2],  // Fila 1
      [2, 0, 1, 2, 0],  // Fila 2
    ],
  };

  beforeEach(() => {
    // Mock del fetch para simular respuesta del backend
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPatternData),
        ok: true,
      } as Response)
    );
  });

  it('DADO: debe mostrar un patrón generado en pantalla', async () => {
    render(<App />);
    
    // 1. Seleccionar un archivo
    const fileInput = screen.getByTitle('file');
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 2. Generar el patrón
    const generateButton = screen.getByText(/Generar Patrón/i);
    fireEvent.click(generateButton);

    // 3. Esperar a que se renderice
    await waitFor(() => {
      expect(screen.getByText(/Vista Previa/i)).toBeInTheDocument();
    });
    
    // 4. Verificar que hay 15 celdas (5 width × 3 height)
    const pixels = screen.getAllByTestId(/^pixel-cell-\d+-\d+$/);
    expect(pixels.length).toBe(15);
  });

  it('CUANDO: hago click en UNA celda de la fila ENTONCES toda la fila debe marcarse', async () => {
    render(<App />);
    
    // Setup: Generar patrón
    const fileInput = screen.getByTitle('file');
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    // ACTION: Click en la primera celda de la fila 1
    const firstCellRow1 = screen.getByTestId('pixel-cell-1-0');
    fireEvent.click(firstCellRow1);

    // EXPECT: TODAS las celdas de la fila 1 deben tener clase 'completed-row'
    for (let col = 0; col < 5; col++) {
      const cell = screen.getByTestId(`pixel-cell-1-${col}`);
      expect(cell).toHaveClass('completed-row');
    }

    // Las otras filas NO deben estar marcadas
    const cellRow0 = screen.getByTestId('pixel-cell-0-0');
    const cellRow2 = screen.getByTestId('pixel-cell-2-0');
    expect(cellRow0).not.toHaveClass('completed-row');
    expect(cellRow2).not.toHaveClass('completed-row');
  });

  it('Y: el estado debe persistir (marcar múltiples filas)', async () => {
    render(<App />);
    
    // Setup
    const fileInput = screen.getByTitle('file');
    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.png')] } });
    fireEvent.click(screen.getByText(/Generar Patrón/i));
    await waitFor(() => screen.getByText(/Vista Previa/i));

    // Marcar fila 0
    fireEvent.click(screen.getByTestId('pixel-cell-0-0'));
    
    // Marcar fila 2
    fireEvent.click(screen.getByTestId('pixel-cell-2-0'));

    // EXPECT: Ambas filas siguen marcadas (persistencia)
    expect(screen.getByTestId('pixel-cell-0-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-0-4')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-0')).toHaveClass('completed-row');
    expect(screen.getByTestId('pixel-cell-2-4')).toHaveClass('completed-row');
    
    // Fila 1 NO debe estar marcada
    expect(screen.getByTestId('pixel-cell-1-0')).not.toHaveClass('completed-row');
  });
});
