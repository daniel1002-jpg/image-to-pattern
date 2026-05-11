import { useState } from 'react';
import { downloadBlob, generatePdfBlob, generatePngBlob, getExportTimestamp } from '../utils/exportHelpers';
import type { PatternData } from '../utils/exportHelpers';
import type { PdfExportOptions } from '../components/PdfExportModal';

export function usePatternExport(pattern: PatternData | null, completedRows: Set<number>) {
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleExportPng = async () => {
    if (!pattern) return;

    const blob = await generatePngBlob(pattern, completedRows);
    const filename = `pattern-${getExportTimestamp()}.png`;

    downloadBlob(blob, filename);
  };

  const handleExportPdfClick = () => {
    setShowPdfModal(true);
  };

  const handlePdfExportConfirm = async (options: PdfExportOptions) => {
    if (!pattern) return;

    try {
      const blob = await generatePdfBlob(pattern, options, completedRows);
      const filename = `pattern-${getExportTimestamp()}.pdf`;
      downloadBlob(blob, filename);
      setShowPdfModal(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF');
    }
  };

  const handlePdfExportCancel = () => {
    setShowPdfModal(false);
  };

  return {
    showPdfModal,
    handleExportPng,
    handleExportPdfClick,
    handlePdfExportConfirm,
    handlePdfExportCancel,
  };
}
