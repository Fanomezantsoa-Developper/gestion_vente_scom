import { useState } from 'react'
import { formatAr } from '../../utils/format'

// Donut chart en SVG pur : data = [{ label, value, color? }]
const PALETTE = ['#5732a6', '#7c4dff', '#00b0a8', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#64748b', '#14b8a6']

function DonutChart({ data, height = 220, colors = PALETTE, formatValue = formatAr, legend = true }) {
  const [active, setActive] = useState(null)

  const items = (data || []).filter((d) => Number(d.value) > 0)
  const total = items.reduce((s, d) => s + Number(d.value), 0) || 1

  const radius = 62
  const stroke = 26
  const circumference = 2 * Math.PI * radius
  const gap = 3

  let acc = 0
  const segments = items.map((d, i) => {
    const frac = Number(d.value) / total
    const dash = Math.max(frac * circumference - gap, 1)
    const seg = { ...d, index: i, color: d.color || colors[i % colors.length], frac, dash, dashOffset: -acc }
    acc += frac * circumference
    return seg
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant gap-2">
        <div className="w-36 h-36 rounded-full bg-surface-container flex items-center justify-center">
          <span className="text-3xl opacity-40">—</span>
        </div>
        <p className="text-sm">Aucune donnée</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ height }}>
        <svg width="200" height={height} viewBox="0 0 200 200" className="h-full w-auto">
          <g transform="rotate(-90 100 100)">
            {segments.map((s) => (
              <circle
                key={s.index}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={active === s.index ? stroke + 6 : stroke}
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={s.dashOffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                style={{ opacity: active === null || active === s.index ? 1 : 0.25 }}
                onMouseEnter={() => setActive(s.index)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${s.label} : ${formatValue(s.value)} (${Math.round(s.frac * 100)}%)`}</title>
              </circle>
            ))}
          </g>
          <text x="100" y="96" textAnchor="middle" fontSize="22" fontWeight="bold" fill="var(--color-on-surface)">
            {active !== null ? `${Math.round(segments[active].frac * 100)}%` : formatValue(total)}
          </text>
          <text x="100" y="118" textAnchor="middle" fontSize="12" fill="var(--color-on-surface-variant)">
            {active !== null ? segments[active].label : 'Total'}
          </text>
        </svg>
      </div>

      {legend && (
        <div className="flex-1 min-w-0 w-full space-y-2">
          {segments.map((s) => (
            <div
              key={s.index}
              onMouseEnter={() => setActive(s.index)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors cursor-default ${
                active === s.index ? 'bg-surface-container' : ''
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-on-surface truncate flex-1">{s.label}</span>
              <span className="text-xs text-on-surface-variant">{Math.round(s.frac * 100)}%</span>
              <span className="text-sm font-semibold text-on-surface">{formatValue(s.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DonutChart
