import TabNav from './components/TabNav';
import OhmsLab from './components/OhmsLab';
import BatteryWorkshop from './components/BatteryWorkshop';
import EnergyCalculator from './components/EnergyCalculator';
import EfficiencyAnalyzer from './components/EfficiencyAnalyzer';
import ConversionDashboard from './components/ConversionDashboard';
import { usePersistedState } from './usePersistedState';
import './App.css';

const TABS = [
  "Ohm's Law & Power",
  'Battery Workshop',
  'Energy & Time',
  'Efficiency Analyzer',
  'Unit Converter',
];

const SECTIONS = [OhmsLab, BatteryWorkshop, EnergyCalculator, EfficiencyAnalyzer, ConversionDashboard];

export default function App() {
  const [activeTab, setActiveTab] = usePersistedState('activeTab', 0);
  const Section = SECTIONS[activeTab];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quantifier</h1>
        <span className="subtitle">Electrical & Energy Visualizer</span>
      </header>
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <main className="app-main">
        <Section />
      </main>
    </div>
  );
}
