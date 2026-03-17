import { useCallback, useEffect } from 'react';
import Slider from './Slider';
import RelationshipWeb from './RelationshipWeb';
import FormulaDisplay from './FormulaDisplay';
import { solveCircuit, recommendedWireGauge, formatNumber } from '../physics';
import type { ElecVar, ElecState } from '../physics';
import { usePersistedState } from '../usePersistedState';

const COLORS: Record<ElecVar, string> = {
  V: '#ff6b6b', I: '#ffd93d', R: '#6bcf7f', P: '#a78bfa',
};

const SLIDER_CONFIGS: { key: ElecVar; label: string; unit: string; min: number; max: number; step: number; log?: boolean }[] = [
  { key: 'V', label: 'Voltage', unit: 'V', min: 0, max: 480, step: 0.1 },
  { key: 'I', label: 'Current', unit: 'A', min: 0.001, max: 200, step: 0.001, log: true },
  { key: 'R', label: 'Resistance', unit: 'Ω', min: 0.01, max: 100000, step: 0.01, log: true },
  { key: 'P', label: 'Power', unit: 'W', min: 0.001, max: 100000, step: 0.001, log: true },
];

function getRealWorldContext(P: number): string {
  if (P < 0.01) return 'Microcontroller sleep current';
  if (P < 0.5) return 'LED indicator';
  if (P < 5) return 'USB device charging';
  if (P < 15) return 'Phone charger';
  if (P < 60) return 'Laptop charger';
  if (P < 100) return 'Desktop monitor';
  if (P < 200) return 'Gaming console';
  if (P < 500) return 'Desktop PC';
  if (P < 1500) return 'Space heater / Microwave';
  if (P < 3000) return 'Clothes dryer';
  if (P < 5000) return 'Electric oven';
  if (P < 10000) return 'EV charger (Level 2)';
  if (P < 50000) return 'EV DC fast charger';
  return 'Industrial equipment';
}

export default function OhmsLab() {
  const [state, setState] = usePersistedState<ElecState>('ohms_state', { V: 12, I: 2, R: 6, P: 24 });
  const [locked, setLocked] = usePersistedState<ElecVar[]>('ohms_locked', ['V', 'I']);

  const toggleLock = useCallback((key: ElecVar) => {
    setLocked(prev => {
      if (prev.includes(key)) {
        if (prev.length <= 2) return prev; // must have at least 2 locked
        return prev.filter(k => k !== key);
      }
      if (prev.length >= 2) {
        // Replace the oldest locked that isn't the one being changed
        return [prev[1], key];
      }
      return [...prev, key];
    });
  }, []);

  const handleChange = useCallback((key: ElecVar, value: number) => {
    setState(prev => {
      const newValues = { ...prev, [key]: value };
      const result = solveCircuit(locked as [ElecVar, ElecVar], newValues);
      return result ?? prev;
    });
  }, [locked]);

  // Re-solve when locks change
  useEffect(() => {
    if (locked.length === 2) {
      const result = solveCircuit(locked as [ElecVar, ElecVar], state);
      if (result) setState(result);
    }
  }, [locked]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24,
        alignItems: 'start',
      }}>
        <div>
          <p style={{ color: '#888', fontSize: 13, margin: '0 0 12px' }}>
            Lock any 2 variables (click the lock icon), then adjust their sliders.
            The other 2 will auto-calculate.
          </p>
          {SLIDER_CONFIGS.map(cfg => (
            <Slider
              key={cfg.key}
              label={cfg.label}
              value={state[cfg.key]}
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              unit={cfg.unit}
              locked={locked.includes(cfg.key)}
              onLockToggle={() => toggleLock(cfg.key)}
              onChange={v => handleChange(cfg.key, v)}
              color={COLORS[cfg.key]}
              logarithmic={cfg.log}
            />
          ))}
        </div>
        <RelationshipWeb V={state.V} I={state.I} R={state.R} P={state.P} locked={locked} />
      </div>

      <FormulaDisplay locked={locked} V={state.V} I={state.I} R={state.R} P={state.P} />

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
      }}>
        <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Wire Gauge (copper)</div>
          <div style={{ fontSize: 18, color: '#ffd93d', fontFamily: 'monospace' }}>
            {recommendedWireGauge(state.I)}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            for {formatNumber(state.I)} A continuous
          </div>
        </div>
        <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Real-World Equivalent</div>
          <div style={{ fontSize: 16, color: '#a78bfa' }}>
            {getRealWorldContext(state.P)}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            at {formatNumber(state.P)} W
          </div>
        </div>
        <div style={{ background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a' }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Heat Dissipation</div>
          <div style={{ fontSize: 16, color: '#ff6b6b' }}>
            {formatNumber(state.P * 3.41214)} BTU/hr
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            if 100% converted to heat
          </div>
        </div>
      </div>
    </div>
  );
}
