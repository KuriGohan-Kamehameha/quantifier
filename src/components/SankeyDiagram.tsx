interface Props {
  inputW: number;
  outputW: number;
  efficiencyPct: number;
  label: string;
}

export default function SankeyDiagram({ inputW, outputW, efficiencyPct, label }: Props) {
  const lossW = inputW - outputW;
  const usefulPct = efficiencyPct;
  const lossPct = 100 - efficiencyPct;

  const usefulHeight = Math.max((usefulPct / 100) * 120, 4);
  const lossHeight = Math.max((lossPct / 100) * 120, 4);
  const totalHeight = usefulHeight + lossHeight + 20;

  return (
    <svg viewBox={`0 0 320 ${totalHeight + 20}`} style={{ width: '100%', maxWidth: 320, height: 'auto' }}>
      {/* Input bar */}
      <rect x={10} y={10} width={40} height={usefulHeight + lossHeight}
        fill="#2a2a4a" rx={4} />
      <text x={30} y={usefulHeight + lossHeight + 30} fill="#888" fontSize={9} textAnchor="middle">
        Input
      </text>
      <text x={30} y={usefulHeight + lossHeight + 42} fill="#ccc" fontSize={10} textAnchor="middle"
        fontFamily="monospace">
        {inputW.toFixed(1)}W
      </text>

      {/* Label */}
      <rect x={100} y={10 + (usefulHeight + lossHeight) / 2 - 14} width={120} height={28}
        fill="#1a1a35" rx={6} stroke="#2a2a4a" />
      <text x={160} y={10 + (usefulHeight + lossHeight) / 2 + 4} fill="#00d4ff" fontSize={11}
        textAnchor="middle" fontWeight={600}>
        {label}
      </text>

      {/* Useful output flow */}
      <path d={`M 50 10 L 100 10 L 220 10 L 270 10 L 270 ${10 + usefulHeight} L 220 ${10 + usefulHeight} L 100 ${10 + usefulHeight} L 50 ${10 + usefulHeight} Z`}
        fill="#6bcf7f33" stroke="#6bcf7f" strokeWidth={1} />
      <text x={290} y={10 + usefulHeight / 2 + 4} fill="#6bcf7f" fontSize={10} fontFamily="monospace">
        {outputW.toFixed(1)}W
      </text>
      <text x={290} y={10 + usefulHeight / 2 + 16} fill="#6bcf7f" fontSize={8}>
        useful ({usefulPct.toFixed(1)}%)
      </text>

      {/* Loss flow — branches downward */}
      <path d={`M 50 ${10 + usefulHeight} L 100 ${10 + usefulHeight} L 160 ${10 + usefulHeight + 10} L 160 ${10 + usefulHeight + lossHeight + 10} L 100 ${10 + usefulHeight + lossHeight} L 50 ${10 + usefulHeight + lossHeight} Z`}
        fill="#ff6b6b22" stroke="#ff6b6b" strokeWidth={1} />
      <text x={175} y={10 + usefulHeight + lossHeight / 2 + 14} fill="#ff6b6b" fontSize={10} fontFamily="monospace">
        {lossW.toFixed(1)}W
      </text>
      <text x={175} y={10 + usefulHeight + lossHeight / 2 + 26} fill="#ff6b6b" fontSize={8}>
        lost ({lossPct.toFixed(1)}%)
      </text>
    </svg>
  );
}
