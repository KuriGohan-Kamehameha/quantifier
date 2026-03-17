export interface EfficiencyPreset {
  name: string;
  category: string;
  efficiencyPercent: number;
  description: string;
}

export const EFFICIENCY_PRESETS: EfficiencyPreset[] = [
  {
    name: 'Incandescent Bulb',
    category: 'Lighting',
    efficiencyPercent: 5,
    description: '~5% visible light, ~95% heat',
  },
  {
    name: 'CFL Bulb',
    category: 'Lighting',
    efficiencyPercent: 12,
    description: '~12% visible light output',
  },
  {
    name: 'LED Bulb',
    category: 'Lighting',
    efficiencyPercent: 40,
    description: '~40% visible light, ~60% heat',
  },
  {
    name: 'Electric Motor (small)',
    category: 'Motors',
    efficiencyPercent: 75,
    description: 'Small brushed DC motor',
  },
  {
    name: 'Electric Motor (industrial)',
    category: 'Motors',
    efficiencyPercent: 95,
    description: 'Large 3-phase induction motor',
  },
  {
    name: 'Gasoline Engine',
    category: 'Engines',
    efficiencyPercent: 25,
    description: 'Typical internal combustion engine',
  },
  {
    name: 'Diesel Engine',
    category: 'Engines',
    efficiencyPercent: 35,
    description: 'Compression ignition engine',
  },
  {
    name: 'Solar Panel (Mono Si)',
    category: 'Generation',
    efficiencyPercent: 22,
    description: 'Monocrystalline silicon panel',
  },
  {
    name: 'Solar Panel (Poly Si)',
    category: 'Generation',
    efficiencyPercent: 17,
    description: 'Polycrystalline silicon panel',
  },
  {
    name: 'Wind Turbine',
    category: 'Generation',
    efficiencyPercent: 40,
    description: 'Modern 3-blade, Betz limit ~59%',
  },
  {
    name: 'Li-ion Charger',
    category: 'Power Supply',
    efficiencyPercent: 92,
    description: 'Typical USB-C PD charger',
  },
  {
    name: 'ATX Power Supply (80+)',
    category: 'Power Supply',
    efficiencyPercent: 85,
    description: '80 Plus certified desktop PSU',
  },
  {
    name: 'ATX Power Supply (80+ Titanium)',
    category: 'Power Supply',
    efficiencyPercent: 96,
    description: 'Top-tier desktop PSU',
  },
  {
    name: 'Grid Transformer',
    category: 'Transmission',
    efficiencyPercent: 98,
    description: 'High-voltage distribution transformer',
  },
  {
    name: 'Inverter (Grid-tie)',
    category: 'Power Conversion',
    efficiencyPercent: 97,
    description: 'Solar/battery grid-tie inverter',
  },
  {
    name: 'DC-DC Buck Converter',
    category: 'Power Conversion',
    efficiencyPercent: 93,
    description: 'Typical switching regulator',
  },
  {
    name: 'Human Body (cycling)',
    category: 'Biological',
    efficiencyPercent: 25,
    description: 'Mechanical efficiency of cycling',
  },
  {
    name: 'Fuel Cell (PEM)',
    category: 'Generation',
    efficiencyPercent: 50,
    description: 'Proton exchange membrane fuel cell',
  },
];
