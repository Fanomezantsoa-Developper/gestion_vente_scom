import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirmer', message, confirmLabel = 'Confirmer', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-red-50 text-error shrink-0">
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-on-surface leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Suppression...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
