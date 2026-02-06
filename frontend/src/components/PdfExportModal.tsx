import React, { useState } from 'react';

interface PdfExportOptionsProps {
  onConfirm: (options: PdfExportOptions) => void;
  onCancel: () => void;
}

export interface PdfExportOptions {
  pageSize: 'A4' | 'Letter';
  includeLegend: boolean;
}

export const PdfExportModal: React.FC<PdfExportOptionsProps> = ({ onConfirm, onCancel }) => {
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [includeLegend, setIncludeLegend] = useState(true);

  const handleConfirm = () => {
    onConfirm({ pageSize, includeLegend });
  };

  return (
    <div className="pdf-export-modal-overlay" onClick={onCancel}>
      <div className="pdf-export-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="pdf-modal-title">
        <h2 id="pdf-modal-title">PDF Export Options</h2>

        <div className="pdf-options-group">
          <label>Page Size:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="pageSize"
                value="A4"
                checked={pageSize === 'A4'}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter')}
              />
              A4
            </label>
            <label>
              <input
                type="radio"
                name="pageSize"
                value="Letter"
                checked={pageSize === 'Letter'}
                onChange={(e) => setPageSize(e.target.value as 'A4' | 'Letter')}
              />
              Letter
            </label>
          </div>
        </div>

        <div className="pdf-options-group">
          <label>
            <input
              type="checkbox"
              checked={includeLegend}
              onChange={(e) => setIncludeLegend(e.target.checked)}
            />
            Include Legend
          </label>
        </div>

        <div className="pdf-modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={handleConfirm} className="pdf-export-btn">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
