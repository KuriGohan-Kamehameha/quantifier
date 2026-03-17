import { useCallback, useRef } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  locked: boolean;
  onLockToggle: () => void;
  onChange: (value: number) => void;
  color: string;
  logarithmic?: boolean;
}

function toLog(value: number, min: number, max: number): number {
  const minLog = Math.log10(Math.max(min, 1e-10));
  const maxLog = Math.log10(Math.max(max, 1e-10));
  const valueLog = Math.log10(Math.max(value, 1e-10));
  return ((valueLog - minLog) / (maxLog - minLog)) * 1000;
}

function fromLog(sliderVal: number, min: number, max: number): number {
  const minLog = Math.log10(Math.max(min, 1e-10));
  const maxLog = Math.log10(Math.max(max, 1e-10));
  const valueLog = minLog + (sliderVal / 1000) * (maxLog - minLog);
  return Math.pow(10, valueLog);
}

export default function Slider({
  label, value, min, max, step, unit, locked, onLockToggle, onChange, color, logarithmic,
}: SliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!locked) return;
    const raw = parseFloat(e.target.value);
    const val = logarithmic ? fromLog(raw, min, max) : raw;
    onChange(val);
  }, [locked, onChange, logarithmic, min, max]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!locked) return;
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) onChange(val);
  }, [locked, onChange]);

  const sliderVal = logarithmic ? toLog(value, min, max) : value;
  const sliderMin = logarithmic ? 0 : min;
  const sliderMax = logarithmic ? 1000 : max;
  const sliderStep = logarithmic ? 1 : step;

  const displayValue = !isFinite(value) ? '∞' :
    value >= 1e6 ? value.toExponential(2) :
    value >= 100 ? value.toFixed(1) :
    value >= 1 ? value.toFixed(2) :
    value >= 0.01 ? value.toFixed(4) :
    value > 0 ? value.toExponential(2) : '0';

  const fillPercent = logarithmic
    ? (toLog(value, min, max) / 1000) * 100
    : ((value - min) / (max - min)) * 100;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
      opacity: locked ? 1 : 0.6,
    }}>
      <button
        onClick={onLockToggle}
        title={locked ? 'This value is locked (you control it)' : 'This value is calculated'}
        style={{
          width: 32, height: 32, border: 'none', borderRadius: 6,
          background: locked ? color : '#2a2a3a',
          color: locked ? '#fff' : '#666',
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center',
          justifyContent: 'center', transition: 'all 0.2s',
          boxShadow: locked ? `0 0 8px ${color}44` : 'none',
        }}
      >
        {locked ? '🔒' : '🔓'}
      </button>
      <div style={{ width: 80, fontWeight: 600, color, fontSize: 14 }}>
        {label}
      </div>
      <input
        ref={inputRef}
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={sliderVal}
        onChange={handleSlider}
        disabled={!locked}
        style={{
          flex: 1, height: 6, appearance: 'none', borderRadius: 3,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${fillPercent}%, #2a2a3a ${fillPercent}%, #2a2a3a 100%)`,
          cursor: locked ? 'pointer' : 'not-allowed',
          accentColor: color,
        }}
      />
      <input
        type="number"
        value={displayValue === '∞' ? '' : displayValue}
        placeholder={displayValue === '∞' ? '∞' : ''}
        onChange={handleInput}
        disabled={!locked}
        style={{
          width: 90, padding: '4px 8px', background: '#1a1a2e', border: `1px solid ${locked ? color : '#333'}`,
          borderRadius: 6, color: '#e0e0e0', textAlign: 'right', fontSize: 14,
          fontFamily: 'monospace',
        }}
      />
      <span style={{ width: 30, color: '#888', fontSize: 13 }}>{unit}</span>
    </div>
  );
}
