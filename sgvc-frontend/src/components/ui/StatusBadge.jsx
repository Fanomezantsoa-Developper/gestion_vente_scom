import { statusInfo } from '../../utils/format'

// Pastille de statut (pill arrondie)
function StatusBadge({ statut }) {
  const info = statusInfo(statut)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.pill}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {info.label}
    </span>
  )
}

export default StatusBadge
