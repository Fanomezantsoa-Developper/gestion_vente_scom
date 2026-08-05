// Formatage des montants en Ariary
export const formatAr = (value) => {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n) + ' Ar'
}

// Date courte : 12/08/2026
export const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Date + heure : 12/08/2026 14:30
export const formatDateTime = (iso) => {
  if (!iso) return '—'
  return (
    new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

// Libellé + style des pills de statut
const STATUTS = {
  EN_ATTENTE: { label: 'En attente', pill: 'bg-orange-100 text-orange-800' },
  VALIDE: { label: 'Validé', pill: 'bg-green-100 text-green-800' },
  ANNULE: { label: 'Annulé', pill: 'bg-red-100 text-red-800' },
  PAYE: { label: 'Payé', pill: 'bg-green-100 text-green-800' },
}

export const statusInfo = (statut) =>
  STATUTS[statut] || { label: statut ?? '—', pill: 'bg-gray-100 text-gray-700' }

// Initiales d'un nom complet (avatar)
export const initials = (nom) =>
  (nom || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

// Extraction du message d'erreur renvoyé par l'API
export const errorMessage = (err) => {
  const data = err?.response?.data
  if (data?.details) {
    return Object.values(data.details).join(', ')
  }
  return data?.message || err?.message || 'Une erreur est survenue'
}
