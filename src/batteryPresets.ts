export interface BatteryPreset {
  name: string;
  voltage: number;
  capacityAh: number;
  chemistry: string;
  internalResistanceMOhm: number;
  cRating: number; // max continuous discharge as multiple of capacity
  weightKg: number;
  volumeL: number;
}

export const BATTERY_PRESETS: BatteryPreset[] = [
  {
    name: 'AAA Alkaline',
    voltage: 1.5,
    capacityAh: 1.2,
    chemistry: 'Alkaline',
    internalResistanceMOhm: 200,
    cRating: 0.5,
    weightKg: 0.012,
    volumeL: 0.0034,
  },
  {
    name: 'AA Alkaline',
    voltage: 1.5,
    capacityAh: 2.5,
    chemistry: 'Alkaline',
    internalResistanceMOhm: 150,
    cRating: 0.5,
    weightKg: 0.023,
    volumeL: 0.0082,
  },
  {
    name: 'AA NiMH',
    voltage: 1.2,
    capacityAh: 2.5,
    chemistry: 'NiMH',
    internalResistanceMOhm: 25,
    cRating: 2,
    weightKg: 0.030,
    volumeL: 0.0082,
  },
  {
    name: '9V Alkaline',
    voltage: 9,
    capacityAh: 0.565,
    chemistry: 'Alkaline',
    internalResistanceMOhm: 1500,
    cRating: 0.2,
    weightKg: 0.046,
    volumeL: 0.022,
  },
  {
    name: 'CR2032',
    voltage: 3,
    capacityAh: 0.225,
    chemistry: 'Li-MnO2',
    internalResistanceMOhm: 15000,
    cRating: 0.03,
    weightKg: 0.003,
    volumeL: 0.001,
  },
  {
    name: '18650 Li-ion',
    voltage: 3.7,
    capacityAh: 3.0,
    chemistry: 'Li-ion',
    internalResistanceMOhm: 40,
    cRating: 3,
    weightKg: 0.048,
    volumeL: 0.0166,
  },
  {
    name: '21700 Li-ion',
    voltage: 3.7,
    capacityAh: 5.0,
    chemistry: 'Li-ion',
    internalResistanceMOhm: 20,
    cRating: 3,
    weightKg: 0.070,
    volumeL: 0.0247,
  },
  {
    name: 'LiFePO4 Cell',
    voltage: 3.2,
    capacityAh: 3.3,
    chemistry: 'LiFePO4',
    internalResistanceMOhm: 25,
    cRating: 5,
    weightKg: 0.095,
    volumeL: 0.035,
  },
  {
    name: '12V Lead-Acid (Car)',
    voltage: 12.6,
    capacityAh: 60,
    chemistry: 'Lead-acid',
    internalResistanceMOhm: 5,
    cRating: 5,
    weightKg: 18,
    volumeL: 8.5,
  },
  {
    name: 'Tesla Powerwall 3',
    voltage: 400,
    capacityAh: 33.75,
    chemistry: 'Li-ion',
    internalResistanceMOhm: 10,
    cRating: 1,
    weightKg: 130,
    volumeL: 165,
  },
  {
    name: 'Phone Battery (typical)',
    voltage: 3.85,
    capacityAh: 4.5,
    chemistry: 'Li-polymer',
    internalResistanceMOhm: 60,
    cRating: 1,
    weightKg: 0.050,
    volumeL: 0.020,
  },
];
