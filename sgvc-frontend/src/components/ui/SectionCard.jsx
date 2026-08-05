// Conteneur de section : en-tête avec icône colorée + titre + actions optionnelles
const CHIP_VARIANTS = {
  primary: 'bg-primary-container text-primary',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  teal: 'bg-teal-100 text-teal-600',
  amber: 'bg-amber-100 text-amber-600',
}

function SectionCard({ icon: Icon, title, subtitle, actions, variant = 'primary', children, className = '' }) {
  const chip = CHIP_VARIANTS[variant] || CHIP_VARIANTS.primary
  return (
    <div className={`bg-white rounded-2xl p-6 border border-outline-variant/60 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`p-2.5 rounded-xl ${chip} shrink-0`}>
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-on-surface truncate">{title}</h2>
            {subtitle && <p className="text-sm text-on-surface-variant truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export default SectionCard
