import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

export const usePatternPan = (
  patternContainerRef: RefObject<HTMLDivElement>,
  zoomLevel: number
) => {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Only allow panning when zoomed in
  const canPan = zoomLevel > 100;

  useEffect(() => {
    const container = patternContainerRef.current;
    if (!container || !canPan) return;

    let currentPanX = panX;
    let currentPanY = panY;
    let currentDragStart = { x: 0, y: 0 };
    let currentIsDragging = isDragging;

    const handleMouseDown = (e: MouseEvent) => {
      currentIsDragging = true;
      currentDragStart = { x: e.clientX - currentPanX, y: e.clientY - currentPanY };
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!currentIsDragging) return;

      const newX = e.clientX - currentDragStart.x;
      const newY = e.clientY - currentDragStart.y;

      // Calculate boundaries
      const maxPan = (zoomLevel - 100) * 2;
      const clampedX = Math.max(-maxPan, Math.min(maxPan, newX));
      const clampedY = Math.max(-maxPan, Math.min(maxPan, newY));

      currentPanX = clampedX;
      currentPanY = clampedY;
      setPanX(clampedX);
      setPanY(clampedY);
    };

    const handleMouseUp = () => {
      currentIsDragging = false;
      setIsDragging(false);
    };

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canPan, zoomLevel, patternContainerRef]);

  // Reset pan when zoom returns to 100%
  useEffect(() => {
    if (!canPan) {
      setPanX(0);
      setPanY(0);
    }
  }, [canPan]);

  // Reset pan state
  const resetPan = () => {
    setPanX(0);
    setPanY(0);
  };

  return {
    panX,
    panY,
    isDragging,
    canPan,
    resetPan,
  };
};
