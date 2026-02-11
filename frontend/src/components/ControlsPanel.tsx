import type { ChangeEvent } from 'react';

interface ControlsPanelProps {
  width: number;
  nColors: number;
  isLoading: boolean;
  canGenerate: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onWidthChange: (value: number) => void;
  onColorsChange: (value: number) => void;
  onGenerate: () => void;
}

export function ControlsPanel({
  width,
  nColors,
  isLoading,
  canGenerate,
  onFileChange,
  onWidthChange,
  onColorsChange,
  onGenerate,
}: ControlsPanelProps) {
  return (
    <div className="controls-panel">
      <div className="control-group">
        <label htmlFor="pattern-file">1. Sube tu imagen</label>
        <input id="pattern-file" title="file" type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <div className="control-group">
        <label>2. Configura el Patrón</label>

        <div className="slider-container">
          <label htmlFor="pattern-width">
            Ancho (puntos): <strong>{width}</strong>
          </label>
          <input
            id="pattern-width"
            title="range"
            type="range"
            min="20"
            max="100"
            step="5"
            value={width}
            onChange={(e) => onWidthChange(Number(e.target.value))}
          />
        </div>

        <div className="slider-container">
          <label htmlFor="pattern-colors">
            Colores: <strong>{nColors}</strong>
          </label>
          <input
            id="pattern-colors"
            title="range"
            type="range"
            min="2"
            max="16"
            step="1"
            value={nColors}
            onChange={(e) => onColorsChange(Number(e.target.value))}
          />
        </div>
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={!canGenerate || isLoading}>
        {isLoading ? 'Tejiendo...' : 'Generar Patrón'}
      </button>
    </div>
  );
}
