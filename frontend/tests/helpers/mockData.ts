/**
 * Mock data reutilizable para tests
 */
export const mockPatternData = {
  status: 'success',
  dimensions: { width: 5, height: 3 },
  palette: ['#FF0000', '#00FF00', '#0000FF'],
  grid: [
    [0, 1, 2, 0, 1],  // Fila 0
    [1, 2, 0, 1, 2],  // Fila 1
    [2, 0, 1, 2, 0],  // Fila 2
  ],
};

export const mockLargePatternData = {
  status: 'success',
  dimensions: { width: 5, height: 4 },
  palette: ['#FF0000', '#00FF00', '#0000FF'],
  grid: [
    [0, 1, 2, 0, 1],
    [1, 2, 0, 1, 2],
    [2, 0, 1, 2, 0],
    [0, 1, 2, 0, 1],
  ],
};

/**
 * Mock para una imagen de prueba
 */
export const createMockFile = (filename: string = 'test.png') => {
  return new File(['dummy content'], filename, { type: 'image/png' });
};
