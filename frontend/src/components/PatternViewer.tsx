import type { RefObject } from 'react';
import type { PatternData } from '../utils/exportHelpers';
import type { RowTrackerState } from '../hooks/useRowTracker';
import { PatternToolbar } from './PatternToolbar';
import { SizeCalculator } from './SizeCalculator';

interface PatternViewerProps {
  pattern: PatternData;
  rowTracker: RowTrackerState;
  activeRow: number | null;
  patternGridRef: RefObject<HTMLDivElement>;
  patternContainerRef: RefObject<HTMLDivElement>;
  zoom: {
    zoomLevel: number;
    canZoomIn: boolean;
    canZoomOut: boolean;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  };
  pan: {
    panX: number;
    panY: number;
    isDragging: boolean;
    canPan: boolean;
  };
  onExportPng: () => void;
  onExportPdf: () => void;
  squareSizeCm: string;
  onSquareSizeChange: (value: string) => void;
}

export function PatternViewer({
  pattern,
  rowTracker,
  activeRow,
  patternGridRef,
  patternContainerRef,
  zoom,
  pan,
  onExportPng,
  onExportPdf,
  squareSizeCm,
  onSquareSizeChange,
}: PatternViewerProps) {
  return (
    <div className="pattern-viewer">
      <h3>Vista Previa (Click en una fila para marcar progreso)</h3>

      <PatternToolbar
        onExportPng={onExportPng}
        onExportPdf={onExportPdf}
        zoomLevel={zoom.zoomLevel}
        canZoomIn={zoom.canZoomIn}
        canZoomOut={zoom.canZoomOut}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onResetZoom={zoom.resetZoom}
      />

      <SizeCalculator
        width={pattern.dimensions.width}
        height={pattern.dimensions.height}
        squareSizeCm={squareSizeCm}
        onSquareSizeChange={onSquareSizeChange}
      />

      <div
        ref={patternContainerRef}
        data-testid="pattern-container"
        className="pattern-container"
        style={{
          transform: `translate(${pan.panX}px, ${pan.panY}px)`,
          cursor: pan.canPan ? 'grab' : 'default',
          transition: pan.isDragging ? 'none' : 'transform 0.1s ease',
        }}
      >
        <div
          ref={patternGridRef}
          data-testid="pattern-grid"
          className="grid-container"
          role="grid"
          aria-label="Pattern preview"
          onDoubleClick={zoom.resetZoom}
          style={{
            gridTemplateColumns: `repeat(${pattern.dimensions.width}, 1fr)`,
            transform: `scale(${zoom.zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease',
          }}
        >
          {pattern.grid.map((row, rowIndex) =>
            row.map((colorIndex, colIndex) => {
              const isDimmed = activeRow !== null && activeRow !== rowIndex;
              const isCompleted = rowTracker.isRowCompleted(rowIndex);

              return (
                <button
                  type="button"
                  key={`${rowIndex}-${colIndex}`}
                  className={`pixel-cell ${isDimmed ? 'dimmed' : ''} ${isCompleted ? 'completed-row' : ''}`}
                  style={{ backgroundColor: pattern.palette[colorIndex] }}
                  onClick={() => rowTracker.toggleRowCompletion(rowIndex)}
                  title={`Fila ${rowIndex + 1}, Color ${colorIndex}`}
                  data-testid={`pixel-cell-${rowIndex}-${colIndex}`}
                  aria-pressed={isCompleted}
                />
              );
            })
          )}
        </div>
      </div>

      <p className="progress-counter">
        {rowTracker.completedCount} de {rowTracker.totalRows} filas completadas
      </p>

      <button className="reset-btn" onClick={rowTracker.resetProgress} aria-label="Reset Progress">
        Reset Progress
      </button>

      {activeRow !== null && (
        <p className="tracker-info">
          Tejiendo Fila: <strong>{activeRow + 1}</strong>
        </p>
      )}
    </div>
  );
}
