import { formatNumber, batteryWh, batteryRuntimeHours } from '../physics';
import type { BatteryPreset } from '../batteryPresets';

interface Props {
  battery: BatteryPreset;
  loadW: number;
  onRemove: () => void;
  onUpdate: (b: BatteryPreset) => void;
}

const CHEMISTRIES = ['Alkaline', 'Li-ion', 'Li-polymer', 'LiFePO4', 'NiMH', 'NiCd', 'Lead-acid', 'Li-MnO2', 'Zinc-air', 'Custom'];

export default function BatteryCard({ battery, loadW, onRemove, onUpdate }: Props) {
  const wh = batteryWh(battery.voltage, battery.capacityAh);
  const runtime = batteryRuntimeHours(wh, loadW);
  const energyJ = wh * 3600;
  const energyDensityWhKg = battery.weightKg > 0 ? wh / battery.weightKg : 0;
  const energyDensityWhL = battery.volumeL > 0 ? wh / battery.volumeL : 0;
  const maxDischargeCurrent = battery.capacityAh * battery.cRating;

  const runtimeDisplay = runtime > 24
    ? `${(runtime / 24).toFixed(1)} days`
    : runtime > 1
    ? `${runtime.toFixed(1)} hrs`
    : `${(runtime * 60).toFixed(0)} min`;

  const updateField = (field: keyof BatteryPreset, value: string | number) => {
    onUpdate({ ...battery, [field]: value });
  };

  return (
    <div style={{
      background: '#12122a', borderRadius: 12, padding: 16,
      border: '1px solid #1f1f3a', minWidth: 280,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <input value={battery.name}
          onChange={e => updateField('name', e.target.value)}
          style={{
            ...inputStyle, fontSize: 15, fontWeight: 600, color: '#00d4ff',
            background: 'transparent', border: '1px solid transparent', width: '70%',
          }}
          onFocus={e => { e.target.style.borderColor = '#00d4ff44'; e.target.style.background = '#1a1a2e'; }}
          onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
          placeholder="Battery name"
        />
        <button onClick={onRemove} style={{
          background: '#2a1520', border: '1px solid #ff4444', borderRadius: 6,
          color: '#ff6666', padding: '2px 8px', cursor: 'pointer', fontSize: 12,
        }}>Remove</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
        <FieldInput label="Voltage (V)" value={battery.voltage} step={0.1}
          onChange={v => updateField('voltage', v)} />
        <FieldInput label="Capacity (Ah)" value={battery.capacityAh} step={0.1}
          onChange={v => updateField('capacityAh', v)} />
        <FieldInput label="Weight (kg)" value={battery.weightKg} step={0.001}
          onChange={v => updateField('weightKg', v)} />
        <FieldInput label="Volume (L)" value={battery.volumeL} step={0.001}
          onChange={v => updateField('volumeL', v)} />
        <FieldInput label="Int. Resistance (mΩ)" value={battery.internalResistanceMOhm} step={1}
          onChange={v => updateField('internalResistanceMOhm', v)} />
        <FieldInput label="C-Rating" value={battery.cRating} step={0.1}
          onChange={v => updateField('cRating', v)} />
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ color: '#888', fontSize: 11 }}>Chemistry</label>
          <select value={CHEMISTRIES.includes(battery.chemistry) ? battery.chemistry : 'Custom'}
            onChange={e => updateField('chemistry', e.target.value)}
            style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}>
            {CHEMISTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
        <Stat label="Energy" value={`${formatNumber(wh)} Wh`} color="#a78bfa" />
        <Stat label="Joules" value={formatNumber(energyJ)} color="#ffd93d" />
        <Stat label="Runtime" value={loadW > 0 ? runtimeDisplay : '—'} color="#6bcf7f" />
        <Stat label="Max Discharge" value={`${formatNumber(maxDischargeCurrent)} A`} color="#ff6b6b" />
        <Stat label="Wh/kg" value={formatNumber(energyDensityWhKg)} color="#00d4ff" />
        <Stat label="Wh/L" value={formatNumber(energyDensityWhL)} color="#00d4ff" />
      </div>
    </div>
  );
}

function FieldInput({ label, value, step, onChange }: {
  label: string; value: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label style={{ color: '#888', fontSize: 11 }}>{label}</label>
      <input type="number" value={value} step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={inputStyle} />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color, fontFamily: 'monospace', fontSize: 13 }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '4px 8px', background: '#1a1a2e',
  border: '1px solid #2a2a4a', borderRadius: 6, color: '#e0e0e0',
  fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box',
};
