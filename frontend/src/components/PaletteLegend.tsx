interface PaletteLegendProps {
  palette: string[];
}

export function PaletteLegend({ palette }: PaletteLegendProps) {
  return (
    <div className="palette-legend">
      <h3>Paleta ({palette.length} colores)</h3>
      <div className="palette-grid">
        {palette.map((color, index) => (
          <div key={color + index} className="swatch-item">
            <div className="swatch-color" style={{ backgroundColor: color }}></div>
            <small>Color {index}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
