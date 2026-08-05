// En-tête de page : bannière avec icône colorée + titre + actions
function PageHeader({ icon: Icon, title, subtitle, actions, variant = 'primary' }) {
  const chips = {
    primary: 'bg-primary text-white',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    orange: 'bg-orange-500 text-white',
    purple: 'bg-purple-600 text-white',
    red: 'bg-red-600 text-white',
    teal: 'bg-teal-600 text-white',
  }
  const chip = chips[variant] || chips.primary
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div className={`p-3 rounded-2xl ${chip} shadow-md shrink-0`}>
            <Icon size={26} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-on-surface truncate">{title}</h1>
          {subtitle && <p className="text-on-surface-variant text-sm mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
    </div>
  )
}

export default PageHeader
