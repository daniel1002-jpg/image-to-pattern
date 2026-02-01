import { useState } from 'react';

/**
 * Custom Hook para gestionar el estado del row tracker
 * 
 * Encapsula toda la lógica de:
 * - Marcar/desmarcar filas
 * - Contar filas completadas
 * - Reset del progreso
 */
export function useRowTracker(totalRows: number) {
  const [completedRows, setCompletedRows] = useState<Set<number>>(new Set());

  /**
   * Toggle para marcar/desmarcar una fila
   */
  const toggleRowCompletion = (rowIndex: number) => {
    setCompletedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  /**
   * Reset de todas las filas completadas
   */
  const resetProgress = () => {
    setCompletedRows(new Set());
  };

  /**
   * Limpiar progress (útil cuando se genera un nuevo patrón)
   */
  const clearProgress = () => {
    setCompletedRows(new Set());
  };

  return {
    completedRows,
    completedCount: completedRows.size,
    totalRows,
    isRowCompleted: (rowIndex: number) => completedRows.has(rowIndex),
    toggleRowCompletion,
    resetProgress,
    clearProgress,
  };
}
