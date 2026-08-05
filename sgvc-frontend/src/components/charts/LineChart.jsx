import { formatAr } from '../../utils/format'

// Graphique en courbe en SVG pur
// data : [{ label, value }]
function LineChart({ data, height = 260 }) {
  if (!data || data.length === 0) return null
  const width = 600
  const padding = { top: 24, right: 16, bottom: 30, left: 16 }
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1)
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
    const y = padding.top + innerH - (Number(d.value) / max) * innerH
    return { x, y, ...d }
  })

  const line = points.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${padding.left},${padding.top + innerH} ${line} ${points[points.length - 1].x},${padding.top + innerH}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + innerH * f}
          y2={padding.top + innerH * f}
          stroke="var(--color-outline-variant)"
          strokeDasharray="4 4"
        />
      ))}
      <polygon points={area} fill="url(#lineFill)" />
      <polyline points={line} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="white" strokeWidth="2">
            <title>{`${p.label} : ${formatAr(p.value)}`}</title>
          </circle>
          <text x={p.x} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--color-on-surface-variant)">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default LineChart
