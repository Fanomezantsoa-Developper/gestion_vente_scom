// Carte KPI : icône colorée, libellé, valeur avec barre d'accent
const VARIANTS = {
  primary: { chip: 'bg-primary-container text-primary', bar: 'bg-primary', hover: 'hover:border-primary/40' },
  blue: { chip: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500', hover: 'hover:border-blue-400/50' },
  green: { chip: 'bg-green-100 text-green-600', bar: 'bg-green-500', hover: 'hover:border-green-400/50' },
  orange: { chip: 'bg-orange-100 text-orange-600', bar: 'bg-orange-500', hover: 'hover:border-orange-400/50' },
  purple: { chip: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500', hover: 'hover:border-purple-400/50' },
  red: { chip: 'bg-red-100 text-red-600', bar: 'bg-red-500', hover: 'hover:border-red-400/50' },
  teal: { chip: 'bg-teal-100 text-teal-600', bar: 'bg-teal-500', hover: 'hover:border-teal-400/50' },
}

function StatCard({ icon: Icon, label, value, sub, variant = 'primary' }) {
  const v = VARIANTS[variant] || VARIANTS.primary
  return (
    <div
      className={`relative bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/60 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${v.hover}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${v.bar}`} />
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${v.chip} shrink-0 shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-on-surface-variant font-medium truncate">{label}</p>
          <p className="text-2xl font-bold text-on-surface truncate leading-tight">{value}</p>
          {sub && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export default StatCard
