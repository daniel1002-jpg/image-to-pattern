interface PatternToolbarProps {
  onExportPng: () => void;
  onExportPdf: () => void;
  zoomLevel: number;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function PatternToolbar({
  onExportPng,
  onExportPdf,
  zoomLevel,
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PatternToolbarProps) {
  return (
    <div className="pattern-toolbar">
      <div className="export-controls">
        <button onClick={onExportPng} aria-label="Export PNG" title="Export PNG">
          Export PNG
        </button>
        <button onClick={onExportPdf} aria-label="Export PDF" title="Export PDF">
          Export PDF
        </button>
      </div>

      <div className="zoom-controls">
        <button onClick={onZoomOut} disabled={!canZoomOut} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <div className="zoom-indicator" data-testid="zoom-indicator">
          {zoomLevel}%
        </div>
        <button onClick={onZoomIn} disabled={!canZoomIn} aria-label="Zoom in" title="Zoom in">
          +
        </button>
        <button
          onClick={onResetZoom}
          disabled={zoomLevel === 100}
          aria-label="Reset Zoom"
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
