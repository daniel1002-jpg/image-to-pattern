import type { RefObject } from 'react';
import type { PatternData } from '../utils/exportHelpers';
import { PaletteLegend } from './PaletteLegend';
import { PatternViewer } from './PatternViewer';

interface RowTrackerState {
  completedRows: Set<number>;
  completedCount: number;
  totalRows: number;
  isRowCompleted: (rowIndex: number) => boolean;
  toggleRowCompletion: (rowIndex: number) => void;
  resetProgress: () => void;
}

interface PatternWorkspaceProps {
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

export function PatternWorkspace({
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
}: PatternWorkspaceProps) {
  return (
    <div className="workspace">
      <PaletteLegend palette={pattern.palette} />
      <PatternViewer
        pattern={pattern}
        rowTracker={rowTracker}
        activeRow={activeRow}
        patternGridRef={patternGridRef}
        patternContainerRef={patternContainerRef}
        zoom={zoom}
        pan={pan}
        onExportPng={onExportPng}
        onExportPdf={onExportPdf}
        squareSizeCm={squareSizeCm}
        onSquareSizeChange={onSquareSizeChange}
      />
    </div>
  );
}
