// ============================================================================
// Physics Engine — All electrical & energy formulas
// Pure functions with no side effects. Constants use NIST/SI reference values.
// ============================================================================

// --- Physical Constants ---
export const JOULES_PER_WH = 3600;
export const JOULES_PER_KWH = 3.6e6;
export const JOULES_PER_CAL = 4.184; // thermochemical calorie
export const JOULES_PER_KCAL = 4184;
export const JOULES_PER_BTU = 1055.06;
export const JOULES_PER_EV = 1.602176634e-19;
export const JOULES_PER_FT_LB = 1.35582;
export const JOULES_PER_ERG = 1e-7;
export const WATTS_PER_HP = 745.7; // mechanical horsepower
export const GRAVITY = 9.80665; // m/s², standard gravity
export const WATER_SPECIFIC_HEAT = 4184; // J/(kg·°C)

// --- Ohm's Law ---
export function voltageFromCurrentResistance(I: number, R: number): number {
  return I * R;
}
export function currentFromVoltageResistance(V: number, R: number): number {
  return R === 0 ? Infinity : V / R;
}
export function resistanceFromVoltageCurrent(V: number, I: number): number {
  return I === 0 ? Infinity : V / I;
}

// --- Power ---
export function powerFromVoltageCurrent(V: number, I: number): number {
  return V * I;
}
export function powerFromCurrentResistance(I: number, R: number): number {
  return I * I * R;
}
export function powerFromVoltageResistance(V: number, R: number): number {
  return R === 0 ? Infinity : (V * V) / R;
}

// --- Derived: solve for any variable given two knowns ---
export type ElecVar = 'V' | 'I' | 'R' | 'P';

export interface ElecState {
  V: number;
  I: number;
  R: number;
  P: number;
}

/**
 * Given two locked variables, compute the other two.
 * Returns the full state or null if the system is unsolvable.
 */
export function solveCircuit(
  locked: [ElecVar, ElecVar],
  values: Partial<ElecState>
): ElecState | null {
  const [a, b] = locked;
  const v = values.V ?? 0;
  const i = values.I ?? 0;
  const r = values.R ?? 0;
  const p = values.P ?? 0;

  const has = (x: ElecVar) => a === x || b === x;

  if (has('V') && has('I')) {
    const V = v, I = i;
    return { V, I, R: resistanceFromVoltageCurrent(V, I), P: powerFromVoltageCurrent(V, I) };
  }
  if (has('V') && has('R')) {
    const V = v, R = r;
    const I = currentFromVoltageResistance(V, R);
    return { V, I, R, P: powerFromVoltageCurrent(V, I) };
  }
  if (has('V') && has('P')) {
    const V = v, P = p;
    const I = V === 0 ? 0 : P / V;
    return { V, I, R: resistanceFromVoltageCurrent(V, I), P };
  }
  if (has('I') && has('R')) {
    const I = i, R = r;
    const V = voltageFromCurrentResistance(I, R);
    return { V, I, R, P: powerFromCurrentResistance(I, R) };
  }
  if (has('I') && has('P')) {
    const I = i, P = p;
    const V = I === 0 ? 0 : P / I;
    return { V, I, R: resistanceFromVoltageCurrent(V, I), P };
  }
  if (has('R') && has('P')) {
    const R = r, P = p;
    const I = R === 0 ? Infinity : Math.sqrt(P / R);
    const V = I * R;
    return { V, I, R, P };
  }
  return null;
}

// --- Energy ---
export function wattHours(powerW: number, timeHours: number): number {
  return powerW * timeHours;
}
export function joules(powerW: number, timeSeconds: number): number {
  return powerW * timeSeconds;
}
export function ampHours(currentA: number, timeHours: number): number {
  return currentA * timeHours;
}

// --- Energy Conversions (from Joules) ---
export function joulesToWh(j: number): number { return j / JOULES_PER_WH; }
export function joulesToKWh(j: number): number { return j / JOULES_PER_KWH; }
export function joulesToCal(j: number): number { return j / JOULES_PER_CAL; }
export function joulesToKCal(j: number): number { return j / JOULES_PER_KCAL; }
export function joulesToBTU(j: number): number { return j / JOULES_PER_BTU; }
export function joulesToEV(j: number): number { return j / JOULES_PER_EV; }
export function joulesToFtLb(j: number): number { return j / JOULES_PER_FT_LB; }
export function joulesToErg(j: number): number { return j / JOULES_PER_ERG; }

// --- Energy Conversions (to Joules) ---
export function whToJoules(wh: number): number { return wh * JOULES_PER_WH; }
export function kwhToJoules(kwh: number): number { return kwh * JOULES_PER_KWH; }
export function calToJoules(cal: number): number { return cal * JOULES_PER_CAL; }
export function kcalToJoules(kcal: number): number { return kcal * JOULES_PER_KCAL; }
export function btuToJoules(btu: number): number { return btu * JOULES_PER_BTU; }
export function evToJoules(ev: number): number { return ev * JOULES_PER_EV; }
export function ftLbToJoules(ftlb: number): number { return ftlb * JOULES_PER_FT_LB; }
export function ergToJoules(erg: number): number { return erg * JOULES_PER_ERG; }

// --- Power Conversions ---
export function wattsToHP(w: number): number { return w / WATTS_PER_HP; }
export function hpToWatts(hp: number): number { return hp * WATTS_PER_HP; }
export function wattsToBTUhr(w: number): number { return w * 3.41214; }
export function wattsToCalPerSec(w: number): number { return w / JOULES_PER_CAL; }
export function wattsToFtLbPerSec(w: number): number { return w / JOULES_PER_FT_LB; }

// --- Real-World Equivalents ---
export function waterTempRiseCelsius(energyJ: number, massKg: number): number {
  return massKg === 0 ? Infinity : energyJ / (massKg * WATER_SPECIFIC_HEAT);
}
export function liftingHeightMeters(energyJ: number, massKg: number): number {
  return massKg === 0 ? Infinity : energyJ / (massKg * GRAVITY);
}

// --- Efficiency ---
export function efficiency(inputW: number, outputW: number): number {
  return inputW === 0 ? 0 : (outputW / inputW) * 100;
}
export function powerLoss(inputW: number, outputW: number): number {
  return inputW - outputW;
}
export function cascadeEfficiency(efficiencies: number[]): number {
  return efficiencies.reduce((acc, eff) => acc * (eff / 100), 1) * 100;
}

// --- Battery ---
export function batteryWh(voltageV: number, capacityAh: number): number {
  return voltageV * capacityAh;
}
export function batteryRuntimeHours(capacityWh: number, loadW: number): number {
  return loadW === 0 ? Infinity : capacityWh / loadW;
}
export function seriesVoltage(voltages: number[]): number {
  return voltages.reduce((s, v) => s + v, 0);
}
export function seriesCapacityAh(capacitiesAh: number[]): number {
  return Math.min(...capacitiesAh);
}
export function parallelVoltage(voltages: number[]): number {
  return voltages.length > 0 ? voltages[0] : 0;
}
export function parallelCapacityAh(capacitiesAh: number[]): number {
  return capacitiesAh.reduce((s, c) => s + c, 0);
}

// --- Wire Gauge Recommendation (simplified NEC table for copper) ---
export function recommendedWireGauge(currentA: number): string {
  if (currentA <= 0.5) return '28 AWG';
  if (currentA <= 1) return '26 AWG';
  if (currentA <= 2.5) return '24 AWG';
  if (currentA <= 4) return '22 AWG';
  if (currentA <= 6) return '20 AWG';
  if (currentA <= 10) return '18 AWG';
  if (currentA <= 15) return '16 AWG';
  if (currentA <= 20) return '14 AWG';
  if (currentA <= 30) return '12 AWG';
  if (currentA <= 40) return '10 AWG';
  if (currentA <= 55) return '8 AWG';
  if (currentA <= 70) return '6 AWG';
  if (currentA <= 95) return '4 AWG';
  if (currentA <= 130) return '2 AWG';
  if (currentA <= 150) return '1 AWG';
  if (currentA <= 200) return '1/0 AWG';
  if (currentA <= 230) return '2/0 AWG';
  if (currentA <= 265) return '3/0 AWG';
  if (currentA <= 310) return '4/0 AWG';
  return '> 4/0 AWG (use bus bar)';
}

// --- Smart number formatting ---
export function formatNumber(n: number, maxDecimals = 4): string {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return n.toExponential(2);
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + 'k';
  if (abs >= 1) return n.toFixed(Math.min(maxDecimals, 2));
  if (abs >= 0.01) return n.toFixed(Math.min(maxDecimals, 4));
  return n.toExponential(2);
}
