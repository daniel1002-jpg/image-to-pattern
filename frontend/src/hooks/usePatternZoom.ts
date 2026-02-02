import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

export const usePatternZoom = (
  patternGridRef: RefObject<HTMLDivElement>,
  enabled: boolean
) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleWheel = (e: WheelEvent) => {
    // Only zoom with Ctrl pressed
    if (!e.ctrlKey) return;

    e.preventDefault();

    setZoomLevel((prevZoom) => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = prevZoom + delta;
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    });
  };

  useEffect(() => {
    const gridElement = patternGridRef.current;
    if (!gridElement || !enabled) return;

    gridElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      gridElement.removeEventListener('wheel', handleWheel);
    };
  }, [patternGridRef, enabled]);

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn: zoomLevel < MAX_ZOOM,
    canZoomOut: zoomLevel > MIN_ZOOM,
  };
};
