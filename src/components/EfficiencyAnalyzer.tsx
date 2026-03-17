import SankeyDiagram from './SankeyDiagram';
import { EFFICIENCY_PRESETS, type EfficiencyPreset } from '../efficiencyPresets';
import { efficiency, powerLoss, cascadeEfficiency, formatNumber } from '../physics';
import { usePersistedState } from '../usePersistedState';

interface SystemEntry {
  name: string;
  inputW: number;
  efficiencyPct: number;
}

export default function EfficiencyAnalyzer() {
  const [systems, setSystems] = usePersistedState<SystemEntry[]>('eff_systems', [
    { name: 'Solar Panel', inputW: 1000, efficiencyPct: 22 },
    { name: 'Inverter', inputW: 220, efficiencyPct: 97 },
  ]);
  const [selectedPreset, setSelectedPreset] = usePersistedState('eff_preset', 0);
  const [cascadeMode, setCascadeMode] = usePersistedState('eff_cascade', false);

  const addSystem = () => {
    const preset = EFFICIENCY_PRESETS[selectedPreset];
    setSystems(prev => [...prev, {
      name: preset.name,
      inputW: 100,
      efficiencyPct: preset.efficiencyPercent,
    }]);
  };

  const addCustom = () => {
    setSystems(prev => [...prev, { name: 'Custom System', inputW: 100, efficiencyPct: 85 }]);
  };

  const removeSystem = (i: number) => {
    setSystems(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateSystem = (i: number, field: keyof SystemEntry, value: string | number) => {
    setSystems(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  // Cascade: output of each becomes input of next
  const cascadeResults = systems.reduce<{ name: string; inputW: number; outputW: number; eff: number }[]>(
    (acc, sys, i) => {
      const input = i === 0 || !cascadeMode ? sys.inputW : acc[i - 1].outputW;
      const output = input * (sys.efficiencyPct / 100);
      acc.push({ name: sys.name, inputW: input, outputW: output, eff: sys.efficiencyPct });
      return acc;
    }, []
  );

  const overallEfficiency = cascadeMode && systems.length > 0
    ? cascadeEfficiency(systems.map(s => s.efficiencyPct))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div style={{
        background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select value={selectedPreset} onChange={e => setSelectedPreset(parseInt(e.target.value))}
          style={selectStyle}>
          {EFFICIENCY_PRESETS.map((p, i) => (
            <option key={i} value={i}>[{p.category}] {p.name} — {p.efficiencyPercent}%</option>
          ))}
        </select>
        <button onClick={addSystem} style={btnStyle}>+ Add Preset</button>
        <button onClick={addCustom} style={{ ...btnStyle, borderColor: '#a78bfa', color: '#a78bfa' }}>
          + Custom System
        </button>
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={cascadeMode} onChange={e => setCascadeMode(e.target.checked)} />
          <span style={{ color: '#888', fontSize: 13 }}>Cascade Mode (chain systems)</span>
        </label>
      </div>

      {/* Systems */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {cascadeResults.map((result, i) => {
          const sys = systems[i];
          const loss = powerLoss(result.inputW, result.outputW);
          return (
            <div key={i} style={{
              background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input value={sys.name}
                    onChange={e => updateSystem(i, 'name', e.target.value)}
                    style={{ ...inputStyle, width: 180, fontSize: 15, fontWeight: 600, color: '#00d4ff' }} />
                  {cascadeMode && i > 0 && (
                    <span style={{ fontSize: 11, color: '#666' }}>
                      (input from previous: {formatNumber(result.inputW)} W)
                    </span>
                  )}
                </div>
                <button onClick={() => removeSystem(i)} style={{
                  background: '#2a1520', border: '1px solid #ff4444', borderRadius: 6,
                  color: '#ff6666', padding: '2px 8px', cursor: 'pointer', fontSize: 12,
                }}>Remove</button>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                  <div>
                    <label style={{ color: '#888', fontSize: 11 }}>
                      {cascadeMode && i > 0 ? 'Input Power (auto)' : 'Input Power (W)'}
                    </label>
                    <input type="number" value={cascadeMode && i > 0 ? result.inputW.toFixed(2) : sys.inputW}
                      step={1} min={0}
                      disabled={cascadeMode && i > 0}
                      onChange={e => updateSystem(i, 'inputW', parseFloat(e.target.value) || 0)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ color: '#888', fontSize: 11 }}>Efficiency (%)</label>
                    <input type="range" min={0} max={100} step={0.5}
                      value={sys.efficiencyPct}
                      onChange={e => updateSystem(i, 'efficiencyPct', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#6bcf7f' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#888' }}>0%</span>
                      <span style={{ color: '#6bcf7f', fontFamily: 'monospace', fontWeight: 700 }}>
                        {sys.efficiencyPct}%
                      </span>
                      <span style={{ color: '#888' }}>100%</span>
                    </div>
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                    background: '#0d0d20', borderRadius: 8, padding: 10,
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#666' }}>OUTPUT</div>
                      <div style={{ fontSize: 15, color: '#6bcf7f', fontFamily: 'monospace' }}>
                        {formatNumber(result.outputW)} W
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#666' }}>HEAT LOSS</div>
                      <div style={{ fontSize: 15, color: '#ff6b6b', fontFamily: 'monospace' }}>
                        {formatNumber(loss)} W
                      </div>
                    </div>
                  </div>
                </div>

                <SankeyDiagram
                  inputW={result.inputW}
                  outputW={result.outputW}
                  efficiencyPct={sys.efficiencyPct}
                  label={sys.name}
                />
              </div>

              {cascadeMode && i < systems.length - 1 && (
                <div style={{
                  textAlign: 'center', padding: '8px 0', color: '#555', fontSize: 20,
                }}>
                  ↓ {formatNumber(result.outputW)} W
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cascade summary */}
      {cascadeMode && systems.length > 1 && (
        <div style={{
          background: '#0d1a0d', borderRadius: 10, padding: 20, border: '1px solid #1a3a1a',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Overall Cascade Efficiency</div>
          <div style={{ fontSize: 36, color: '#6bcf7f', fontFamily: 'monospace', fontWeight: 700 }}>
            {overallEfficiency.toFixed(2)}%
          </div>
          {cascadeResults.length > 0 && (
            <div style={{ fontSize: 14, color: '#ccc', marginTop: 8 }}>
              {formatNumber(cascadeResults[0].inputW)} W in →{' '}
              {formatNumber(cascadeResults[cascadeResults.length - 1].outputW)} W out →{' '}
              {formatNumber(cascadeResults[0].inputW - cascadeResults[cascadeResults.length - 1].outputW)} W lost
            </div>
          )}
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            {systems.map(s => `${s.name} (${s.efficiencyPct}%)`).join(' → ')}
          </div>
        </div>
      )}

      {/* Preset reference */}
      <div style={{
        background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
      }}>
        <h4 style={{ margin: '0 0 12px', color: '#888', fontSize: 13 }}>Reference: Common Efficiencies</h4>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8,
        }}>
          {EFFICIENCY_PRESETS.map((p, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '4px 8px',
              borderRadius: 4, background: '#1a1a2e', fontSize: 12,
            }}>
              <span style={{ color: '#ccc' }}>{p.name}</span>
              <span style={{ color: '#6bcf7f', fontFamily: 'monospace' }}>{p.efficiencyPercent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px', background: '#1a1a2e', border: '1px solid #2a2a4a',
  borderRadius: 6, color: '#e0e0e0', fontFamily: 'monospace', fontSize: 14,
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  padding: '8px 12px', background: '#1a1a2e', border: '1px solid #2a2a4a',
  borderRadius: 6, color: '#e0e0e0', fontSize: 13,
};

const btnStyle: React.CSSProperties = {
  padding: '8px 16px', background: 'transparent', border: '1px solid #00d4ff',
  borderRadius: 6, color: '#00d4ff', cursor: 'pointer', fontSize: 13,
};
