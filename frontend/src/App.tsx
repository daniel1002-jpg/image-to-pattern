import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useRowTracker } from './hooks/useRowTracker';
import { usePatternZoom } from './hooks/usePatternZoom';
import { usePatternPan } from './hooks/usePatternPan';
import { usePatternGenerator } from './hooks/usePatternGenerator';
import { usePatternExport } from './hooks/usePatternExport';
import { PdfExportModal } from './components/PdfExportModal';
import { ControlsPanel } from './components/ControlsPanel';
import { PatternWorkspace } from './components/PatternWorkspace';
import './App.css';

function App() {
  const [squareSizeCm, setSquareSizeCm] = useState('1');

  // Tracker de la fila activa
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const {
    selectedFile,
    pattern,
    isLoading,
    width,
    nColors,
    setWidth,
    setNColors,
    handleFileChange: handleFileChangeBase,
    handleGenerate: handleGenerateBase,
  } = usePatternGenerator();

  // Custom hook para gestionar el tracker de filas completadas
  const rowTracker = useRowTracker(pattern?.grid.length || 0);

  // Ref for pattern grid and zoom hook
  const patternGridRef = useRef<HTMLDivElement>(null!);
  const patternContainerRef = useRef<HTMLDivElement>(null!);
  const zoom = usePatternZoom(patternGridRef, Boolean(pattern));
  const pan = usePatternPan(patternContainerRef, zoom.zoomLevel);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChangeBase(e);
    if (e.target.files && e.target.files[0]) {
      zoom.resetZoom();
      pan.resetPan();
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setActiveRow(null);
    rowTracker.clearProgress();
    zoom.resetZoom();
    pan.resetPan();

    await handleGenerateBase();
  };

  const {
    showPdfModal,
    handleExportPng,
    handleExportPdfClick,
    handlePdfExportConfirm,
    handlePdfExportCancel,
  } = usePatternExport(pattern, rowTracker.completedRows);

  return (
    <div className="container">
      <h1>🧶 Image-to-Pattern MVP</h1>
      
      <ControlsPanel
        width={width}
        nColors={nColors}
        isLoading={isLoading}
        canGenerate={Boolean(selectedFile)}
        onFileChange={handleFileChange}
        onWidthChange={setWidth}
        onColorsChange={setNColors}
        onGenerate={handleGenerate}
      />

      {pattern && (
        <PatternWorkspace
          pattern={pattern}
          rowTracker={rowTracker}
          activeRow={activeRow}
          patternGridRef={patternGridRef}
          patternContainerRef={patternContainerRef}
          zoom={zoom}
          pan={pan}
          onExportPng={handleExportPng}
          onExportPdf={handleExportPdfClick}
          squareSizeCm={squareSizeCm}
          onSquareSizeChange={setSquareSizeCm}
        />
      )}
      
      {showPdfModal && (
        <PdfExportModal onConfirm={handlePdfExportConfirm} onCancel={handlePdfExportCancel} />
      )}
    </div>
  );
}

export default App;
