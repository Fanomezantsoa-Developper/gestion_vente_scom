import { formatAr } from '../../utils/format'

// Graphique à barres en SVG pur (pas de dépendance externe)
// data : [{ label, value }]
function BarChart({ data, height = 240 }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1)

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max((Number(d.value) / max) * 100, 2)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group" title={`${d.label} : ${formatAr(d.value)}`}>
              <span className="text-[11px] font-semibold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                {formatAr(d.value)}
              </span>
              <div
                className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-primary to-primary/60 group-hover:from-primary-dark group-hover:to-primary transition-colors"
                style={{ height: `${h}%` }}
              />
              <span className="text-[11px] text-on-surface-variant font-medium">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BarChart
