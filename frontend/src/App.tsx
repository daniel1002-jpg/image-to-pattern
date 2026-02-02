import { useState, useRef } from 'react';
import { useRowTracker } from './hooks/useRowTracker';
import { usePatternZoom } from './hooks/usePatternZoom';
import './App.css';

interface PatternData {
  status: string;
  dimensions: {
    width: number;
    height: number;
  };
  palette: string[];
  grid: number[][];
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuración del patrón
  const [width, setWidth] = useState(50);
  const [nColors, setNColors] = useState(5);
  
  // Tracker de la fila activa (antigua funcionalidad)
  const [activeRow, setActiveRow] = useState<number | null>(null);
  
  // Custom hook para gestionar el tracker de filas completadas
  const rowTracker = useRowTracker(pattern?.grid.length || 0);

  // Ref for pattern grid and zoom hook
  const patternGridRef = useRef<HTMLDivElement>(null!);
  const zoom = usePatternZoom(patternGridRef, Boolean(pattern));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPattern(null); // Limpiar resultado anterior
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setPattern(null);
    setActiveRow(null);
    rowTracker.clearProgress(); // Limpiar filas completadas

    const formData = new FormData();
    formData.append('file', selectedFile);
    // Enviamos los valores de los sliders al backend
    formData.append('width', width.toString());
    formData.append('n_colors', nColors.toString());

    try {
      const response = await fetch('http://127.0.0.1:8000/process-image/', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if(data.error) throw new Error(data.error);
      setPattern(data);
    } catch (error) {
      console.error(error);
      alert("Error al procesar. Revisa que el backend esté corriendo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🧶 Image-to-Pattern MVP</h1>
      
      <div className="controls-panel">
        {/* Input de Archivo */}
        <div className="control-group">
          <label>1. Sube tu imagen</label>
          <input title='file' type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Sliders de Configuración */}
        <div className="control-group">
          <label>2. Configura el Patrón</label>
          
          <div className="slider-container">
            <span>Ancho (puntos): <strong>{width}</strong></span>
            <input 
              title='range' type="range" min="20" max="100" step="5"
              value={width} 
              onChange={(e) => setWidth(parseInt(e.target.value))} 
            />
          </div>

          <div className="slider-container">
            <span>Colores: <strong>{nColors}</strong></span>
            <input 
              title='range' type="range" min="2" max="16" step="1"
              value={nColors} 
              onChange={(e) => setNColors(parseInt(e.target.value))} 
            />
          </div>
        </div>

        <button 
          className="generate-btn"
          onClick={handleGenerate} 
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Tejiendo...' : 'Generar Patrón'}
        </button>
      </div>

      {pattern && (
        <div className="workspace">
          {/* LEYENDA (Izquierda o Arriba) */}
          <div className="palette-legend">
            <h3>Paleta ({pattern.palette.length} colores)</h3>
            <div className="palette-grid">
              {pattern.palette.map((color, index) => (
                <div key={index} className="swatch-item">
                  <div className="swatch-color" style={{ backgroundColor: color }}></div>
                  <small>Color {index}</small>
                </div>
              ))}
            </div>
          </div>

          {/* PATRÓN INTERACTIVO */}
          <div className="pattern-viewer">
            <h3>Vista Previa (Click en una fila para marcar progreso)</h3>
            
            {/* Zoom controls */}
            <div className="zoom-controls">
              <button 
                onClick={zoom.zoomOut}
                disabled={!zoom.canZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
              >
                −
              </button>
              <div className="zoom-indicator" data-testid="zoom-indicator">
                {zoom.zoomLevel}%
              </div>
              <button 
                onClick={zoom.zoomIn}
                disabled={!zoom.canZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
              >
                +
              </button>
            </div>
            
            <div 
                            ref={patternGridRef}
                            data-testid="pattern-grid"
              className="grid-container"
              style={{
                gridTemplateColumns: `repeat(${pattern.dimensions.width}, 1fr)`,
                transform: `scale(${zoom.zoomLevel / 100})`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease'
              }}
            >
              {pattern.grid.map((row, rowIndex) => (
                // Renderizamos fila por fila para poder manejar el tracker
                row.map((colorIndex, colIndex) => {
                   // Si hay una fila activa y NO es esta, la oscurecemos (opacity)
                   const isDimmed = activeRow !== null && activeRow !== rowIndex;
                   // ESCENARIO 1: Verificar si la fila está completada
                   const isCompleted = rowTracker.isRowCompleted(rowIndex);
                   
                   return (
                    <div 
                      key={`${rowIndex}-${colIndex}`}
                      className={`pixel-cell ${isDimmed ? 'dimmed' : ''} ${isCompleted ? 'completed-row' : ''}`}
                      style={{ backgroundColor: pattern.palette[colorIndex] }}
                      onClick={() => rowTracker.toggleRowCompletion(rowIndex)} // Toggle completion via hook
                      title={`Fila ${rowIndex + 1}, Color ${colorIndex}`}
                      data-testid={`pixel-cell-${rowIndex}-${colIndex}`}
                    />
                   )
                })
              ))}
            </div>
            
            {/* ESCENARIO 3: Contador de progreso */}
            <p className="progress-counter">
              {rowTracker.completedCount} de {rowTracker.totalRows} filas completadas
            </p>
            
            {/* ESCENARIO 4: Botón de reset */}
            <button 
              className="reset-btn"
              onClick={rowTracker.resetProgress}
              aria-label="Reset Progress"
            >
              Reset Progress
            </button>
            
            {activeRow !== null && (
               <p className="tracker-info">Tejiendo Fila: <strong>{activeRow + 1}</strong></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;