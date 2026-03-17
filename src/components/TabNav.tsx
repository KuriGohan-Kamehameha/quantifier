interface TabNavProps {
  tabs: string[];
  active: number;
  onChange: (index: number) => void;
}

const TAB_ICONS = ['⚡', '🔋', '⏱️', '⚙️', '🔄'];

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <nav style={{
      display: 'flex', gap: 4, padding: '8px 16px',
      background: '#0d0d1a', borderBottom: '1px solid #1a1a2e',
      overflowX: 'auto', flexShrink: 0,
    }}>
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          style={{
            padding: '10px 20px', border: 'none', borderRadius: '8px 8px 0 0',
            background: active === i ? '#1a1a2e' : 'transparent',
            color: active === i ? '#00d4ff' : '#888',
            cursor: 'pointer', fontSize: 14, fontWeight: active === i ? 700 : 400,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            borderBottom: active === i ? '2px solid #00d4ff' : '2px solid transparent',
          }}
        >
          {TAB_ICONS[i]} {tab}
        </button>
      ))}
    </nav>
  );
}
