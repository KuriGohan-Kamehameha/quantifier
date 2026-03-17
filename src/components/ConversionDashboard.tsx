import { useCallback } from 'react';
import {
  JOULES_PER_WH, JOULES_PER_KWH, JOULES_PER_CAL, JOULES_PER_KCAL,
  JOULES_PER_BTU, JOULES_PER_EV, JOULES_PER_FT_LB, JOULES_PER_ERG,
  WATTS_PER_HP, formatNumber,
} from '../physics';
import { usePersistedState } from '../usePersistedState';

// --- Energy units ---
interface EnergyUnit {
  key: string;
  label: string;
  symbol: string;
  toJoules: number; // multiply by this to get Joules
  color: string;
}

const ENERGY_UNITS: EnergyUnit[] = [
  { key: 'J', label: 'Joules', symbol: 'J', toJoules: 1, color: '#ffd93d' },
  { key: 'Wh', label: 'Watt-hours', symbol: 'Wh', toJoules: JOULES_PER_WH, color: '#a78bfa' },
  { key: 'kWh', label: 'Kilowatt-hours', symbol: 'kWh', toJoules: JOULES_PER_KWH, color: '#a78bfa' },
  { key: 'cal', label: 'Calories (thermo)', symbol: 'cal', toJoules: JOULES_PER_CAL, color: '#ff9f43' },
  { key: 'kcal', label: 'Kilocalories', symbol: 'kcal', toJoules: JOULES_PER_KCAL, color: '#ff9f43' },
  { key: 'BTU', label: 'BTU', symbol: 'BTU', toJoules: JOULES_PER_BTU, color: '#ff6b6b' },
  { key: 'eV', label: 'Electron-volts', symbol: 'eV', toJoules: JOULES_PER_EV, color: '#00d4ff' },
  { key: 'ftlb', label: 'Foot-pounds', symbol: 'ft·lbs', toJoules: JOULES_PER_FT_LB, color: '#6bcf7f' },
  { key: 'erg', label: 'Ergs', symbol: 'erg', toJoules: JOULES_PER_ERG, color: '#888' },
];

// --- Power units ---
interface PowerUnit {
  key: string;
  label: string;
  symbol: string;
  toWatts: number;
  color: string;
}

const POWER_UNITS: PowerUnit[] = [
  { key: 'W', label: 'Watts', symbol: 'W', toWatts: 1, color: '#a78bfa' },
  { key: 'kW', label: 'Kilowatts', symbol: 'kW', toWatts: 1000, color: '#a78bfa' },
  { key: 'HP', label: 'Horsepower', symbol: 'HP', toWatts: WATTS_PER_HP, color: '#6bcf7f' },
  { key: 'BTUhr', label: 'BTU/hr', symbol: 'BTU/hr', toWatts: 1 / 3.41214, color: '#ff6b6b' },
  { key: 'cals', label: 'cal/s', symbol: 'cal/s', toWatts: JOULES_PER_CAL, color: '#ff9f43' },
  { key: 'ftlbs', label: 'ft·lbs/s', symbol: 'ft·lbs/s', toWatts: JOULES_PER_FT_LB, color: '#ffd93d' },
];

// --- Charge units ---
interface ChargeUnit {
  key: string;
  label: string;
  symbol: string;
  toCoulombs: number;
  color: string;
}

const CHARGE_UNITS: ChargeUnit[] = [
  { key: 'C', label: 'Coulombs', symbol: 'C', toCoulombs: 1, color: '#00d4ff' },
  { key: 'Ah', label: 'Amp-hours', symbol: 'Ah', toCoulombs: 3600, color: '#ffd93d' },
  { key: 'mAh', label: 'Milliamp-hours', symbol: 'mAh', toCoulombs: 3.6, color: '#ffd93d' },
];

type Category = 'energy' | 'power' | 'charge';

export default function ConversionDashboard() {
  const [category, setCategory] = usePersistedState<Category>('conv_category', 'energy');
  const [energyJ, setEnergyJ] = usePersistedState('conv_energyJ', 3600);
  const [powerW, setPowerW] = usePersistedState('conv_powerW', 100);
  const [chargeC, setChargeC] = usePersistedState('conv_chargeC', 3600);
  const [showReference, setShowReference] = usePersistedState('conv_showRef', false);

  const handleEnergyChange = useCallback((key: string, raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    const unit = ENERGY_UNITS.find(u => u.key === key)!;
    setEnergyJ(val * unit.toJoules);
  }, []);

  const handlePowerChange = useCallback((key: string, raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    const unit = POWER_UNITS.find(u => u.key === key)!;
    setPowerW(val * unit.toWatts);
  }, []);

  const handleChargeChange = useCallback((key: string, raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    const unit = CHARGE_UNITS.find(u => u.key === key)!;
    setChargeC(val * unit.toCoulombs);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['energy', 'power', 'charge'] as Category[]).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '10px 24px', border: 'none', borderRadius: 8,
            background: category === cat ? '#1a1a2e' : 'transparent',
            color: category === cat ? '#00d4ff' : '#666',
            cursor: 'pointer', fontSize: 14, fontWeight: category === cat ? 700 : 400,
            textTransform: 'capitalize',
          }}>
            {cat}
          </button>
        ))}
      </div>

      <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
        Type a value in any field — all others update instantly.
      </p>

      {/* Conversion grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12,
      }}>
        {category === 'energy' && ENERGY_UNITS.map(unit => {
          const val = energyJ / unit.toJoules;
          return (
            <UnitField key={unit.key} unit={unit} value={val}
              onChange={raw => handleEnergyChange(unit.key, raw)} />
          );
        })}
        {category === 'power' && POWER_UNITS.map(unit => {
          const val = powerW / unit.toWatts;
          return (
            <UnitField key={unit.key} unit={unit} value={val}
              onChange={raw => handlePowerChange(unit.key, raw)} />
          );
        })}
        {category === 'charge' && CHARGE_UNITS.map(unit => {
          const val = chargeC / unit.toCoulombs;
          return (
            <UnitField key={unit.key} unit={unit} value={val}
              onChange={raw => handleChargeChange(unit.key, raw)} />
          );
        })}
      </div>

      {/* Reference table toggle */}
      <button onClick={() => setShowReference(p => !p)} style={{
        padding: '10px 20px', background: '#12122a', border: '1px solid #1f1f3a',
        borderRadius: 8, color: '#888', cursor: 'pointer', fontSize: 13, textAlign: 'left',
      }}>
        {showReference ? '▾' : '▸'} Conversion Factor Reference
      </button>

      {showReference && (
        <div style={{
          background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={thStyle}>From</th>
                <th style={thStyle}>To</th>
                <th style={thStyle}>Factor</th>
              </tr>
            </thead>
            <tbody>
              {ENERGY_UNITS.filter(u => u.key !== 'J').map(unit => (
                <tr key={unit.key}>
                  <td style={tdStyle}>1 {unit.symbol}</td>
                  <td style={tdStyle}>Joules</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', color: unit.color }}>
                    {formatNumber(unit.toJoules)}
                  </td>
                </tr>
              ))}
              {POWER_UNITS.filter(u => u.key !== 'W').map(unit => (
                <tr key={unit.key}>
                  <td style={tdStyle}>1 {unit.symbol}</td>
                  <td style={tdStyle}>Watts</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', color: unit.color }}>
                    {formatNumber(unit.toWatts)}
                  </td>
                </tr>
              ))}
              {CHARGE_UNITS.filter(u => u.key !== 'C').map(unit => (
                <tr key={unit.key}>
                  <td style={tdStyle}>1 {unit.symbol}</td>
                  <td style={tdStyle}>Coulombs</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', color: unit.color }}>
                    {formatNumber(unit.toCoulombs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UnitField({ unit, value, onChange }: {
  unit: { label: string; symbol: string; color: string };
  value: number;
  onChange: (raw: string) => void;
}) {
  return (
    <div style={{
      background: '#12122a', borderRadius: 10, padding: 14, border: '1px solid #1f1f3a',
    }}>
      <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
        {unit.label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          value={!isFinite(value) ? '' : value < 0.001 && value > 0 ? value.toExponential(4) : parseFloat(value.toPrecision(8))}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, padding: '8px 10px', background: '#1a1a2e',
            border: `1px solid ${unit.color}44`, borderRadius: 6,
            color: unit.color, fontFamily: 'monospace', fontSize: 16, fontWeight: 600,
            boxSizing: 'border-box',
          }}
        />
        <span style={{ color: '#888', fontSize: 13, minWidth: 40 }}>{unit.symbol}</span>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '6px 10px', color: '#888',
  borderBottom: '1px solid #2a2a4a', fontSize: 12,
};

const tdStyle: React.CSSProperties = {
  padding: '4px 10px', color: '#ccc', borderBottom: '1px solid #1a1a2e',
};
