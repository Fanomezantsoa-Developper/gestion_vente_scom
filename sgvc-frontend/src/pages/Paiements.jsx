import { useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  Plus,
  FileText,
  XCircle,
  Trash2,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  ReceiptText,
} from 'lucide-react'
import { paiementService } from '../services/paiementService'
import { bonCommandeService } from '../services/bonCommandeService'
import { downloadFile } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, formatAr, formatDateTime } from '../utils/format'

const MODES = {
  ESPECES: { label: 'Espèces', icon: Banknote, cls: 'bg-green-50 text-green-700' },
  CARTE: { label: 'Carte', icon: CreditCard, cls: 'bg-blue-50 text-blue-700' },
  MOBILE: { label: 'Mobile Money', icon: Smartphone, cls: 'bg-purple-50 text-purple-700' },
  CHEQUE: { label: 'Chèque', icon: Banknote, cls: 'bg-orange-50 text-orange-700' },
}

function Paiements() {
  const [paiements, setPaiements] = useState([])
  const [bons, setBons] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ bonId: '', modePaiement: 'ESPECES' })
  const [saving, setSaving] = useState(false)
  const [detail, setDetail] = useState(null)
  const [annulerTarget, setAnnulerTarget] = useState(null)
  const [annulerLoading, setAnnulerLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    try {
      const res = await paiementService.getAll()
      setPaiements(res.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bonCommandeService.getAll().then((r) => setBons(r.data)).catch(() => {})
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bonsPayables = useMemo(() => {
    const paidBonIds = new Set(paiements.filter((p) => p.statut === 'PAYE').map((p) => p.bonCommande?.id))
    return bons.filter((b) => b.statut !== 'ANNULE' && !paidBonIds.has(b.id))
  }, [bons, paiements])

  const bonSelectionne = bons.find((b) => b.id === Number(form.bonId))

  const filtered = paiements.filter((p) => {
    if (!q) return true
    const texte = `${p.bonCommande?.id} ${p.bonCommande?.vendeur?.prenom} ${p.bonCommande?.vendeur?.nom} ${p.bonCommande?.client?.prenom} ${p.bonCommande?.client?.nom}`.toLowerCase()
    return texte.includes(q.toLowerCase())
  })

  const openCreate = () => {
    setForm({ bonId: '', modePaiement: 'ESPECES' })
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.bonId) {
      showToast('Sélectionnez un bon de commande', 'error')
      return
    }
    setSaving(true)
    try {
      await paiementService.create({ bonCommande: { id: Number(form.bonId) }, modePaiement: form.modePaiement })
      showToast('Paiement enregistré avec succès')
      setCreateOpen(false)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAnnuler = async () => {
    setAnnulerLoading(true)
    try {
      await paiementService.annuler(annulerTarget.id)
      showToast('Paiement annulé, le bon repasse en attente')
      setAnnulerTarget(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setAnnulerLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await paiementService.delete(deleting.id)
      showToast('Paiement supprimé')
      setDeleting(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePdf = async (p) => {
    try {
      await downloadFile(`/paiements/${p.id}/export-pdf`, `recu-paiement-${p.id}.pdf`)
      showToast('Reçu PDF téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  const handleExport = async () => {
    try {
      await downloadFile('/paiements/export-csv', 'paiements.csv')
      showToast('Export CSV téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des paiements"
        subtitle="Encaissements des bons de commande et reçus"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher un paiement..." className="w-64" />
            <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
            <Button icon={Plus} onClick={openCreate}>Encaisser un paiement</Button>
          </>
        }
      />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Paiements encaissés', value: paiements.filter((p) => p.statut === 'PAYE').length, cls: 'text-green-700 bg-green-50' },
          { label: 'Paiements annulés', value: paiements.filter((p) => p.statut === 'ANNULE').length, cls: 'text-red-700 bg-red-50' },
          { label: 'Montant encaissé', value: formatAr(paiements.filter((p) => p.statut === 'PAYE').reduce((s, p) => s + Number(p.montant), 0)), cls: 'text-primary bg-primary-container/20' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-outline-variant/60">
            <p className="text-sm text-on-surface-variant">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.cls.split(' ')[0]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={Wallet}
            title={q ? 'Aucun résultat' : 'Aucun paiement'}
            message={q ? `Aucun paiement ne correspond à « ${q} ».` : 'Enregistrez votre premier paiement.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-3.5 font-semibold">N°</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold">Bon</th>
                  <th className="px-6 py-3.5 font-semibold">Client</th>
                  <th className="px-6 py-3.5 font-semibold">Mode</th>
                  <th className="px-6 py-3.5 font-semibold">Statut</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Montant</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const mode = MODES[p.modePaiement] || MODES.ESPECES
                  const ModeIcon = mode.icon
                  return (
                    <tr key={p.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">#{p.id}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{formatDateTime(p.datePaiement)}</td>
                      <td className="px-6 py-4">Bon #{p.bonCommande?.id}</td>
                      <td className="px-6 py-4">{p.bonCommande?.client?.prenom} {p.bonCommande?.client?.nom}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${mode.cls}`}>
                          <ModeIcon size={13} /> {mode.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          p.statut === 'PAYE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.statut === 'PAYE' ? 'Payé' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{formatAr(p.montant)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-0.5">
                          <button onClick={() => setDetail(p)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors" title="Détails">
                            <ReceiptText size={17} />
                          </button>
                          <button onClick={() => handlePdf(p)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors" title="Reçu PDF">
                            <FileText size={17} />
                          </button>
                          {p.statut === 'PAYE' && (
                            <button onClick={() => setAnnulerTarget(p)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-orange-600 transition-colors" title="Annuler le paiement">
                              <XCircle size={17} />
                            </button>
                          )}
                          <button onClick={() => setDeleting(p)} className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Supprimer">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Encaisser un paiement"
        subtitle="Le montant est automatiquement égal au total du bon"
        width="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Bon de commande <span className="text-error">*</span></label>
            <select
              value={form.bonId}
              onChange={(e) => setForm({ ...form, bonId: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            >
              <option value="">Sélectionner un bon non payé...</option>
              {bonsPayables.map((b) => (
                <option key={b.id} value={b.id}>
                  Bon #{b.id} — {b.client?.prenom} {b.client?.nom} — {formatAr(b.montantTotal)}
                </option>
              ))}
            </select>
            {bonsPayables.length === 0 && (
              <p className="text-xs text-orange-600 mt-1.5">Aucun bon en attente de paiement.</p>
            )}
          </div>

          {bonSelectionne && (
            <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Total à encaisser</span>
              <span className="text-lg font-bold text-primary">{formatAr(bonSelectionne.montantTotal)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Mode de paiement <span className="text-error">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MODES).map(([key, m]) => {
                const Icon = m.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, modePaiement: key })}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      form.modePaiement === key
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-outline-variant text-on-surface-variant hover:border-secondary/40'
                    }`}
                  >
                    <Icon size={18} /> {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving} icon={Wallet}>
              {saving ? 'Enregistrement...' : 'Confirmer le paiement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal détails */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`Reçu de paiement #${detail?.id}`}
        subtitle={detail ? formatDateTime(detail.datePaiement) : ''}
        width="max-w-md"
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Client</span>
              <span className="font-semibold">{detail.bonCommande?.client?.prenom} {detail.bonCommande?.client?.nom}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Bon associé</span>
              <span className="font-semibold text-primary">#{detail.bonCommande?.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Mode</span>
              <span className="font-semibold">{MODES[detail.modePaiement]?.label || detail.modePaiement}</span>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant pt-3">
              <span className="text-on-surface-variant">Montant</span>
              <span className="text-xl font-bold text-primary">{formatAr(detail.montant)}</span>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" icon={FileText} onClick={() => handlePdf(detail)}>Télécharger le reçu</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!annulerTarget}
        onClose={() => setAnnulerTarget(null)}
        onConfirm={handleAnnuler}
        loading={annulerLoading}
        title="Annuler le paiement"
        message={`Annuler le paiement #${annulerTarget?.id} de ${formatAr(annulerTarget?.montant)} ? Le bon repassera en attente.`}
        confirmLabel="Annuler le paiement"
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le paiement"
        message={`Voulez-vous vraiment supprimer le paiement #${deleting?.id} ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Paiements
