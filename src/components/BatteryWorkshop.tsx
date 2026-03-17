import BatteryCard from './BatteryCard';
import { BATTERY_PRESETS, type BatteryPreset } from '../batteryPresets';
import {
  batteryWh, batteryRuntimeHours, seriesVoltage, seriesCapacityAh,
  parallelVoltage, parallelCapacityAh, formatNumber,
} from '../physics';
import { usePersistedState } from '../usePersistedState';

const DEFAULT_CUSTOM: BatteryPreset = {
  name: 'My Custom Battery',
  voltage: 3.7,
  capacityAh: 2.0,
  chemistry: 'Li-ion',
  internalResistanceMOhm: 50,
  cRating: 1,
  weightKg: 0.05,
  volumeL: 0.02,
};

export default function BatteryWorkshop() {
  const [batteries, setBatteries] = usePersistedState<BatteryPreset[]>('batteries', [
    { ...BATTERY_PRESETS[5] },
    { ...BATTERY_PRESETS[1] },
  ]);
  const [loadW, setLoadW] = usePersistedState('battery_load', 5);
  const [selectedPreset, setSelectedPreset] = usePersistedState('battery_preset', 0);
  const [compareMetric, setCompareMetric] = usePersistedState<'wh' | 'runtime' | 'density' | 'joules'>('battery_metric', 'wh');

  const [targetW, setTargetW] = usePersistedState('battery_targetW', 10);
  const [targetHours, setTargetHours] = usePersistedState('battery_targetH', 8);

  const addBattery = () => {
    setBatteries(prev => [...prev, { ...BATTERY_PRESETS[selectedPreset] }]);
  };

  const addCustomBattery = () => {
    setBatteries(prev => [...prev, { ...DEFAULT_CUSTOM, name: `Custom Battery ${prev.length + 1}` }]);
  };

  const removeBattery = (i: number) => {
    setBatteries(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateBattery = (i: number, b: BatteryPreset) => {
    setBatteries(prev => prev.map((bat, idx) => idx === i ? b : bat));
  };

  // Series / Parallel calculations
  const seriesV = seriesVoltage(batteries.map(b => b.voltage));
  const seriesAh = batteries.length > 0 ? seriesCapacityAh(batteries.map(b => b.capacityAh)) : 0;
  const seriesWh = batteryWh(seriesV, seriesAh);

  const parallelV = batteries.length > 0 ? parallelVoltage(batteries.map(b => b.voltage)) : 0;
  const parallelAh = parallelCapacityAh(batteries.map(b => b.capacityAh));
  const parallelWh = batteryWh(parallelV, parallelAh);

  // Comparison chart data
  const getMetricValue = (b: BatteryPreset) => {
    const wh = batteryWh(b.voltage, b.capacityAh);
    switch (compareMetric) {
      case 'wh': return wh;
      case 'runtime': return batteryRuntimeHours(wh, loadW);
      case 'density': return b.weightKg > 0 ? wh / b.weightKg : 0;
      case 'joules': return wh * 3600;
    }
  };
  const metricLabel: Record<string, string> = {
    wh: 'Watt-hours', runtime: 'Runtime (hrs)', density: 'Wh/kg', joules: 'Joules',
  };
  const maxMetric = Math.max(...batteries.map(getMetricValue), 0.001);

  // Problem solver
  const requiredWh = targetW * targetHours;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Add battery controls */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
      }}>
        <select value={selectedPreset} onChange={e => setSelectedPreset(parseInt(e.target.value))}
          style={{
            padding: '8px 12px', background: '#1a1a2e', border: '1px solid #2a2a4a',
            borderRadius: 6, color: '#e0e0e0', fontSize: 14,
          }}>
          {BATTERY_PRESETS.map((b, i) => (
            <option key={i} value={i}>{b.name}</option>
          ))}
        </select>
        <button onClick={addBattery} style={{
          padding: '8px 20px', background: '#00d4ff22', border: '1px solid #00d4ff',
          borderRadius: 6, color: '#00d4ff', cursor: 'pointer', fontSize: 14,
        }}>+ Add Preset</button>
        <button onClick={addCustomBattery} style={{
          padding: '8px 20px', background: '#a78bfa22', border: '1px solid #a78bfa',
          borderRadius: 6, color: '#a78bfa', cursor: 'pointer', fontSize: 14,
        }}>+ Custom Battery</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#888', fontSize: 13 }}>Load:</label>
          <input type="number" value={loadW} step={0.5} min={0}
            onChange={e => setLoadW(parseFloat(e.target.value) || 0)}
            style={{
              width: 80, padding: '6px 8px', background: '#1a1a2e',
              border: '1px solid #2a2a4a', borderRadius: 6, color: '#e0e0e0',
              fontFamily: 'monospace', fontSize: 14,
            }} />
          <span style={{ color: '#888', fontSize: 13 }}>W</span>
        </div>
      </div>

      {/* Battery cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16,
      }}>
        {batteries.map((b, i) => (
          <BatteryCard key={i} battery={b} loadW={loadW}
            onRemove={() => removeBattery(i)}
            onUpdate={updated => updateBattery(i, updated)} />
        ))}
      </div>

      {batteries.length > 0 && (
        <>
          {/* Comparison chart */}
          <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ margin: 0, color: '#00d4ff', fontSize: 14 }}>Comparison</h4>
              <select value={compareMetric}
                onChange={e => setCompareMetric(e.target.value as typeof compareMetric)}
                style={{
                  padding: '4px 10px', background: '#1a1a2e', border: '1px solid #2a2a4a',
                  borderRadius: 6, color: '#e0e0e0', fontSize: 12,
                }}>
                <option value="wh">Watt-hours</option>
                <option value="runtime">Runtime at load</option>
                <option value="density">Energy Density (Wh/kg)</option>
                <option value="joules">Joules</option>
              </select>
            </div>
            {batteries.map((b, i) => {
              const val = getMetricValue(b);
              const pct = (val / maxMetric) * 100;
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ccc', marginBottom: 2 }}>
                    <span>{b.name}</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatNumber(val)} {metricLabel[compareMetric]?.split('(')[1]?.replace(')', '') || ''}</span>
                  </div>
                  <div style={{ background: '#1a1a2e', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`, height: '100%',
                      background: `hsl(${(i * 60) % 360}, 70%, 55%)`,
                      borderRadius: 4, transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Series / Parallel */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
              <h4 style={{ margin: '0 0 12px', color: '#ff6b6b', fontSize: 14 }}>
                Series ({batteries.length} cells)
              </h4>
              <div style={{ fontSize: 13, color: '#ccc', lineHeight: 2 }}>
                <div>Voltage: <span style={{ color: '#ff6b6b', fontFamily: 'monospace' }}>{formatNumber(seriesV)} V</span></div>
                <div>Capacity: <span style={{ color: '#ffd93d', fontFamily: 'monospace' }}>{formatNumber(seriesAh)} Ah</span></div>
                <div>Energy: <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{formatNumber(seriesWh)} Wh</span></div>
                <div>Runtime: <span style={{ color: '#6bcf7f', fontFamily: 'monospace' }}>
                  {loadW > 0 ? formatNumber(batteryRuntimeHours(seriesWh, loadW)) + ' hrs' : '—'}
                </span></div>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
                Voltages add, capacity = lowest cell
              </div>
            </div>
            <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
              <h4 style={{ margin: '0 0 12px', color: '#6bcf7f', fontSize: 14 }}>
                Parallel ({batteries.length} cells)
              </h4>
              <div style={{ fontSize: 13, color: '#ccc', lineHeight: 2 }}>
                <div>Voltage: <span style={{ color: '#ff6b6b', fontFamily: 'monospace' }}>{formatNumber(parallelV)} V</span></div>
                <div>Capacity: <span style={{ color: '#ffd93d', fontFamily: 'monospace' }}>{formatNumber(parallelAh)} Ah</span></div>
                <div>Energy: <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{formatNumber(parallelWh)} Wh</span></div>
                <div>Runtime: <span style={{ color: '#6bcf7f', fontFamily: 'monospace' }}>
                  {loadW > 0 ? formatNumber(batteryRuntimeHours(parallelWh, loadW)) + ' hrs' : '—'}
                </span></div>
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
                Voltage = first cell, capacities add (same voltage cells only)
              </div>
            </div>
          </div>
        </>
      )}

      {/* Problem Solver */}
      <div style={{
        background: '#0d1a0d', borderRadius: 10, padding: 20, border: '1px solid #1a3a1a',
      }}>
        <h4 style={{ margin: '0 0 16px', color: '#6bcf7f', fontSize: 14 }}>
          Problem Solver: "I need to power..."
        </h4>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="number" value={targetW} step={1} min={0}
              onChange={e => setTargetW(parseFloat(e.target.value) || 0)}
              style={{ ...solverInput, width: 80 }} />
            <span style={{ color: '#888', fontSize: 13 }}>watts for</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="number" value={targetHours} step={0.5} min={0}
              onChange={e => setTargetHours(parseFloat(e.target.value) || 0)}
              style={{ ...solverInput, width: 80 }} />
            <span style={{ color: '#888', fontSize: 13 }}>hours</span>
          </div>
          <span style={{ color: '#6bcf7f', fontFamily: 'monospace', fontSize: 15 }}>
            = {formatNumber(requiredWh)} Wh needed
          </span>
        </div>
        {batteries.length > 0 && (
          <div style={{ fontSize: 13, color: '#ccc' }}>
            {batteries.map((b, i) => {
              const wh = batteryWh(b.voltage, b.capacityAh);
              const needed = Math.ceil(requiredWh / wh);
              return (
                <div key={i} style={{
                  padding: '6px 0', borderBottom: '1px solid #1a2a1a',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{b.name}</span>
                  <span style={{ fontFamily: 'monospace', color: needed <= 1 ? '#6bcf7f' : '#ffd93d' }}>
                    {needed} cell{needed !== 1 ? 's' : ''} in parallel
                    ({formatNumber(wh * needed)} Wh)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const solverInput: React.CSSProperties = {
  padding: '6px 10px', background: '#1a2e1a', border: '1px solid #2a4a2a',
  borderRadius: 6, color: '#e0e0e0', fontFamily: 'monospace', fontSize: 14,
};
