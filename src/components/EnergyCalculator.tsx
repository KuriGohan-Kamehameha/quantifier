import {
  joules, wattHours, ampHours, joulesToWh, joulesToKWh, joulesToCal,
  joulesToKCal, joulesToBTU, joulesToEV, joulesToFtLb, joulesToErg,
  waterTempRiseCelsius, liftingHeightMeters, formatNumber,
} from '../physics';
import { usePersistedState } from '../usePersistedState';

type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

const TIME_MULTIPLIERS: Record<TimeUnit, number> = {
  seconds: 1, minutes: 60, hours: 3600, days: 86400,
};

export default function EnergyCalculator() {
  const [powerW, setPowerW] = usePersistedState('energy_power', 100);
  const [timeVal, setTimeVal] = usePersistedState('energy_time', 1);
  const [timeUnit, setTimeUnit] = usePersistedState<TimeUnit>('energy_timeUnit', 'hours');
  const [voltageV, setVoltageV] = usePersistedState('energy_voltage', 12);
  const [costPerKwh, setCostPerKwh] = usePersistedState('energy_cost', 0.12);

  const timeSeconds = timeVal * TIME_MULTIPLIERS[timeUnit];
  const timeHours = timeSeconds / 3600;

  const energyJ = joules(powerW, timeSeconds);
  const energyWh = wattHours(powerW, timeHours);
  const energyAh = ampHours(voltageV > 0 ? powerW / voltageV : 0, timeHours);

  const cost = joulesToKWh(energyJ) * costPerKwh;

  const conversions = [
    { label: 'Joules', value: energyJ, unit: 'J', color: '#ffd93d' },
    { label: 'Watt-hours', value: energyWh, unit: 'Wh', color: '#a78bfa' },
    { label: 'Kilowatt-hours', value: joulesToKWh(energyJ), unit: 'kWh', color: '#a78bfa' },
    { label: 'Amp-hours', value: energyAh, unit: 'Ah', color: '#ff6b6b' },
    { label: 'Calories', value: joulesToCal(energyJ), unit: 'cal', color: '#ff9f43' },
    { label: 'Kilocalories', value: joulesToKCal(energyJ), unit: 'kcal', color: '#ff9f43' },
    { label: 'BTU', value: joulesToBTU(energyJ), unit: 'BTU', color: '#ff6b6b' },
    { label: 'Electron-volts', value: joulesToEV(energyJ), unit: 'eV', color: '#00d4ff' },
    { label: 'Foot-pounds', value: joulesToFtLb(energyJ), unit: 'ft·lbs', color: '#6bcf7f' },
    { label: 'Ergs', value: joulesToErg(energyJ), unit: 'erg', color: '#888' },
  ];

  // Real-world equivalents
  const waterTempRise1L = waterTempRiseCelsius(energyJ, 1);
  const liftHeight70kg = liftingHeightMeters(energyJ, 70);
  const phoneCharges = energyWh / 17.3; // typical phone battery ~17.3 Wh
  const teslaPercent = (energyWh / 75000) * 100; // Model 3 LR ~75 kWh

  // Animated bar
  const barPercent = Math.min((energyWh / 1000) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Inputs */}
      <div style={{
        background: '#12122a', borderRadius: 10, padding: 20, border: '1px solid #1f1f3a',
      }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Power</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="number" value={powerW} step={1} min={0}
                onChange={e => setPowerW(parseFloat(e.target.value) || 0)}
                style={inputStyle} />
              <span style={{ color: '#888', fontSize: 13 }}>W</span>
            </div>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Time</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="number" value={timeVal} step={0.1} min={0}
                onChange={e => setTimeVal(parseFloat(e.target.value) || 0)}
                style={inputStyle} />
              <select value={timeUnit} onChange={e => setTimeUnit(e.target.value as TimeUnit)}
                style={{ ...inputStyle, width: 100 }}>
                <option value="seconds">sec</option>
                <option value="minutes">min</option>
                <option value="hours">hrs</option>
                <option value="days">days</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Voltage (for Ah)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="number" value={voltageV} step={0.1} min={0.1}
                onChange={e => setVoltageV(parseFloat(e.target.value) || 0.1)}
                style={inputStyle} />
              <span style={{ color: '#888', fontSize: 13 }}>V</span>
            </div>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 4 }}>Electricity cost</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#888', fontSize: 13 }}>$</span>
              <input type="number" value={costPerKwh} step={0.01} min={0}
                onChange={e => setCostPerKwh(parseFloat(e.target.value) || 0)}
                style={inputStyle} />
              <span style={{ color: '#888', fontSize: 12 }}>/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy bar */}
      <div style={{
        background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: '#888' }}>Energy Accumulation</span>
          <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{formatNumber(energyWh)} Wh</span>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: 6, height: 24, overflow: 'hidden' }}>
          <div style={{
            width: `${barPercent}%`, height: '100%',
            background: 'linear-gradient(90deg, #a78bfa, #00d4ff)',
            borderRadius: 6, transition: 'width 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#fff', fontWeight: 600,
          }}>
            {barPercent > 10 ? `${barPercent.toFixed(0)}% of 1 kWh` : ''}
          </div>
        </div>
      </div>

      {/* Conversion grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12,
      }}>
        {conversions.map(c => (
          <div key={c.label} style={{
            background: '#12122a', borderRadius: 10, padding: 14, border: '1px solid #1f1f3a',
          }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 17, color: c.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {formatNumber(c.value)}
            </div>
            <div style={{ fontSize: 11, color: '#555' }}>{c.unit}</div>
          </div>
        ))}
      </div>

      {/* Cost */}
      <div style={{
        background: '#1a1a10', borderRadius: 10, padding: 16, border: '1px solid #3a3a1a',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: '#888' }}>Cost to run:</div>
        <div style={{ fontSize: 24, color: '#ffd93d', fontFamily: 'monospace', fontWeight: 700 }}>
          ${cost < 0.01 ? cost.toExponential(2) : cost.toFixed(4)}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          at ${costPerKwh}/kWh
        </div>
      </div>

      {/* Real-world equivalents */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
      }}>
        <EquivalentCard
          icon="💧"
          title="Water Heating"
          value={`Heat 1L water by ${formatNumber(waterTempRise1L)}°C`}
          detail={waterTempRise1L >= 100 ? `(could boil ${formatNumber(waterTempRise1L / 100)} liters)` : ''}
        />
        <EquivalentCard
          icon="🏋️"
          title="Gravitational PE"
          value={`Lift 70 kg to ${formatNumber(liftHeight70kg)} m`}
          detail={liftHeight70kg >= 1000 ? `(${formatNumber(liftHeight70kg / 1000)} km altitude)` : ''}
        />
        <EquivalentCard
          icon="📱"
          title="Phone Charges"
          value={`${formatNumber(phoneCharges)} full charges`}
          detail="based on ~17.3 Wh phone battery"
        />
        <EquivalentCard
          icon="🚗"
          title="Tesla Model 3"
          value={`${formatNumber(teslaPercent)}% of battery`}
          detail="75 kWh Long Range pack"
        />
      </div>
    </div>
  );
}

function EquivalentCard({ icon, title, value, detail }: { icon: string; title: string; value: string; detail: string }) {
  return (
    <div style={{
      background: '#12122a', borderRadius: 10, padding: 16, border: '1px solid #1f1f3a',
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#e0e0e0' }}>{value}</div>
      {detail && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{detail}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: 90, padding: '6px 10px', background: '#1a1a2e',
  border: '1px solid #2a2a4a', borderRadius: 6, color: '#e0e0e0',
  fontFamily: 'monospace', fontSize: 14,
};
