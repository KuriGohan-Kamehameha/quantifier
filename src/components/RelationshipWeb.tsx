import type { ElecVar } from '../physics';

interface Props {
  V: number;
  I: number;
  R: number;
  P: number;
  locked: ElecVar[];
}

const NODES: { key: ElecVar; label: string; unit: string; color: string; cx: number; cy: number }[] = [
  { key: 'V', label: 'Voltage', unit: 'V', color: '#ff6b6b', cx: 150, cy: 30 },
  { key: 'I', label: 'Current', unit: 'A', color: '#ffd93d', cx: 270, cy: 120 },
  { key: 'R', label: 'Resistance', unit: 'Ω', color: '#6bcf7f', cx: 150, cy: 210 },
  { key: 'P', label: 'Power', unit: 'W', color: '#a78bfa', cx: 30, cy: 120 },
];

const EDGES: [ElecVar, ElecVar, string][] = [
  ['V', 'I', 'V = I × R'],
  ['V', 'R', 'R = V / I'],
  ['I', 'R', 'V = I × R'],
  ['V', 'P', 'P = V × I'],
  ['I', 'P', 'P = V × I'],
  ['R', 'P', 'P = I²R'],
];

function getNodePos(key: ElecVar) {
  return NODES.find(n => n.key === key)!;
}

function formatVal(n: number): string {
  if (!isFinite(n)) return '∞';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  if (n >= 1) return n.toFixed(1);
  if (n >= 0.001) return (n * 1000).toFixed(0) + 'm';
  return n.toExponential(1);
}

export default function RelationshipWeb({ V, I, R, P, locked }: Props) {
  const values: Record<ElecVar, number> = { V, I, R, P };

  return (
    <svg viewBox="0 0 300 240" style={{ width: '100%', maxWidth: 360, height: 'auto' }}>
      {EDGES.map(([a, b, label], i) => {
        const na = getNodePos(a);
        const nb = getNodePos(b);
        const midX = (na.cx + nb.cx) / 2;
        const midY = (na.cy + nb.cy) / 2;
        return (
          <g key={i}>
            <line
              x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
              stroke="#2a2a4a" strokeWidth={2} opacity={0.5}
            />
            <text x={midX} y={midY} fill="#555" fontSize={7} textAnchor="middle" dy={-3}>
              {label}
            </text>
          </g>
        );
      })}
      {NODES.map(node => {
        const isLocked = locked.includes(node.key);
        const val = values[node.key];
        return (
          <g key={node.key}>
            <circle
              cx={node.cx} cy={node.cy} r={28}
              fill={isLocked ? node.color + '22' : '#1a1a2e'}
              stroke={node.color}
              strokeWidth={isLocked ? 3 : 1.5}
              style={{ filter: isLocked ? `drop-shadow(0 0 6px ${node.color}66)` : 'none' }}
            />
            <text x={node.cx} y={node.cy - 8} fill={node.color} fontSize={11}
              textAnchor="middle" fontWeight={700}>
              {node.label}
            </text>
            <text x={node.cx} y={node.cy + 8} fill="#fff" fontSize={12}
              textAnchor="middle" fontFamily="monospace" fontWeight={600}>
              {formatVal(val)}
            </text>
            <text x={node.cx} y={node.cy + 20} fill="#888" fontSize={9}
              textAnchor="middle">
              {node.unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
