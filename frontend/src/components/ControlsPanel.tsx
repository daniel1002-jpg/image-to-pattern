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
        <label>1. Sube tu imagen</label>
        <input title="file" type="file" accept="image/*" onChange={onFileChange} />
      </div>

      <div className="control-group">
        <label>2. Configura el Patrón</label>

        <div className="slider-container">
          <span>
            Ancho (puntos): <strong>{width}</strong>
          </span>
          <input
            title="range"
            type="range"
            min="20"
            max="100"
            step="5"
            value={width}
            onChange={(e) => onWidthChange(parseInt(e.target.value))}
          />
        </div>

        <div className="slider-container">
          <span>
            Colores: <strong>{nColors}</strong>
          </span>
          <input
            title="range"
            type="range"
            min="2"
            max="16"
            step="1"
            value={nColors}
            onChange={(e) => onColorsChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      <button className="generate-btn" onClick={onGenerate} disabled={!canGenerate || isLoading}>
        {isLoading ? 'Tejiendo...' : 'Generar Patrón'}
      </button>
    </div>
  );
}
