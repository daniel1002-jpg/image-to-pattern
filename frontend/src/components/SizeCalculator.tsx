interface SizeCalculatorProps {
  width: number;
  height: number;
  squareSizeCm: string;
  onSquareSizeChange: (value: string) => void;
}

const formatSizeValue = (value: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.0+$/, '');
};

export function SizeCalculator({
  width,
  height,
  squareSizeCm,
  onSquareSizeChange,
}: SizeCalculatorProps) {
  const parsedSize = Number.parseFloat(squareSizeCm);
  const multiplier = Number.isFinite(parsedSize) ? parsedSize : 0;
  const estimatedWidth = width * multiplier;
  const estimatedHeight = height * multiplier;

  return (
    <div className="size-calculator">
      <label htmlFor="square-size-input">Tamaño del cuadrado (cm)</label>
      <input
        id="square-size-input"
        type="number"
        min="0.1"
        step="0.1"
        value={squareSizeCm}
        onChange={(e) => onSquareSizeChange(e.target.value)}
      />
      <p className="size-estimate">
        Tamaño estimado: {formatSizeValue(estimatedWidth)} cm x {formatSizeValue(estimatedHeight)} cm
      </p>
    </div>
  );
}
