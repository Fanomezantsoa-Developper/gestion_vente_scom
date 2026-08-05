import { Loader2 } from 'lucide-react'

// Écran de chargement
function Spinner({ label = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-primary-container animate-pulse" />
        <Loader2 size={28} className="animate-spin text-primary absolute inset-0 m-auto" />
      </div>
      <p className="text-sm text-on-surface-variant font-medium">{label}</p>
    </div>
  )
}

export default Spinner
