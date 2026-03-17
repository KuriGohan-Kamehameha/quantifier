import type { ElecVar } from '../physics';

interface FormulaDisplayProps {
  locked: ElecVar[];
  V: number;
  I: number;
  R: number;
  P: number;
}

interface FormulaInfo {
  formula: string;
  description: string;
}

function getActiveFormulas(locked: ElecVar[]): FormulaInfo[] {
  const has = (v: ElecVar) => locked.includes(v);
  const formulas: FormulaInfo[] = [];

  if (has('V') && has('I')) {
    formulas.push({ formula: 'R = V / I', description: 'Resistance from Ohm\'s Law' });
    formulas.push({ formula: 'P = V × I', description: 'Power equation' });
  } else if (has('V') && has('R')) {
    formulas.push({ formula: 'I = V / R', description: 'Current from Ohm\'s Law' });
    formulas.push({ formula: 'P = V² / R', description: 'Power from voltage and resistance' });
  } else if (has('V') && has('P')) {
    formulas.push({ formula: 'I = P / V', description: 'Current from power and voltage' });
    formulas.push({ formula: 'R = V² / P', description: 'Resistance from voltage and power' });
  } else if (has('I') && has('R')) {
    formulas.push({ formula: 'V = I × R', description: 'Voltage from Ohm\'s Law' });
    formulas.push({ formula: 'P = I² × R', description: 'Power from current and resistance' });
  } else if (has('I') && has('P')) {
    formulas.push({ formula: 'V = P / I', description: 'Voltage from power and current' });
    formulas.push({ formula: 'R = P / I²', description: 'Resistance from power and current' });
  } else if (has('R') && has('P')) {
    formulas.push({ formula: 'I = √(P / R)', description: 'Current from power and resistance' });
    formulas.push({ formula: 'V = √(P × R)', description: 'Voltage from power and resistance' });
  }

  return formulas;
}

export default function FormulaDisplay({ locked, V, I, R, P }: FormulaDisplayProps) {
  const formulas = getActiveFormulas(locked);
  const fmt = (n: number) => !isFinite(n) ? '∞' : n >= 1000 ? n.toExponential(2) : n.toFixed(3);

  return (
    <div style={{
      background: '#12122a', borderRadius: 10, padding: 16,
      border: '1px solid #1f1f3a',
    }}>
      <h4 style={{ margin: '0 0 10px', color: '#00d4ff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
        Active Formulas
      </h4>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {formulas.map((f, i) => (
          <div key={i} style={{
            background: '#1a1a35', borderRadius: 8, padding: '10px 16px',
            border: '1px solid #2a2a4a', flex: '1 1 200px',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 18, color: '#fff', marginBottom: 4 }}>
              {f.formula}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>{f.description}</div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap',
        padding: '10px 12px', background: '#0d0d20', borderRadius: 8,
        fontFamily: 'monospace', fontSize: 13,
      }}>
        <span style={{ color: '#ff6b6b' }}>V = {fmt(V)} V</span>
        <span style={{ color: '#ffd93d' }}>I = {fmt(I)} A</span>
        <span style={{ color: '#6bcf7f' }}>R = {fmt(R)} Ω</span>
        <span style={{ color: '#a78bfa' }}>P = {fmt(P)} W</span>
      </div>
    </div>
  );
}
