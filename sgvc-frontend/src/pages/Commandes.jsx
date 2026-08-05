import { useEffect, useMemo, useState } from 'react'
import {
  ShoppingCart,
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  Download,
  Trash,
} from 'lucide-react'
import { bonCommandeService } from '../services/bonCommandeService'
import { vendeurService } from '../services/vendeurService'
import { clientService } from '../services/clientService'
import { produitService } from '../services/produitService'
import { paiementService } from '../services/paiementService'
import { downloadFile } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import StatusBadge from '../components/ui/StatusBadge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, formatAr, formatDateTime } from '../utils/format'

const FILTRES = [
  { key: '', label: 'Toutes' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'VALIDE', label: 'Validées' },
  { key: 'PAYE', label: 'Payées' },
  { key: 'ANNULE', label: 'Annulées' },
]

function Commandes() {
  const [bons, setBons] = useState([])
  const [vendeurs, setVendeurs] = useState([])
  const [clients, setClients] = useState([])
  const [produits, setProduits] = useState([])
  const [paidIds, setPaidIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [filtre, setFiltre] = useState('')
  const [detail, setDetail] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [actionTarget, setActionTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { showToast } = useToast()

  // Formulaire de création
  const [form, setForm] = useState({ vendeurId: '', clientId: '' })
  const [lignes, setLignes] = useState([{ produitId: '', quantite: 1 }])

  const load = async () => {
    try {
      const [bonsRes, paiementsRes] = await Promise.all([
        q ? bonCommandeService.rechercher(q) : bonCommandeService.getAll(),
        paiementService.getAll(),
      ])
      setBons(bonsRes.data)
      setPaidIds(new Set(paiementsRes.data.filter((p) => p.statut === 'PAYE').map((p) => p.bonCommande?.id)))
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    vendeurService.getAll().then((r) => setVendeurs(r.data)).catch(() => {})
    clientService.getAll().then((r) => setClients(r.data)).catch(() => {})
    produitService.getAll().then((r) => setProduits(r.data)).catch(() => {})
    setLoading(true)
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const bonsFiltres = useMemo(() => {
    return bons.filter((b) => {
      if (filtre === 'PAYE') return paidIds.has(b.id)
      if (filtre) return b.statut === filtre
      return true
    })
  }, [bons, filtre, paidIds])

  const isPaid = (bon) => paidIds.has(bon.id)

  const montantLigne = (ligne) => {
    const p = produits.find((x) => x.id === Number(ligne.produitId))
    return p ? Number(p.prix) * Number(ligne.quantite) : 0
  }

  const totalLignes = lignes.reduce((sum, l) => sum + montantLigne(l), 0)

  const resetForm = () => {
    setForm({ vendeurId: '', clientId: '' })
    setLignes([{ produitId: '', quantite: 1 }])
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const lignesValides = lignes.filter((l) => l.produitId && Number(l.quantite) > 0)
      if (lignesValides.length === 0) {
        showToast('Ajoutez au moins un produit', 'error')
        return
      }
      await bonCommandeService.create({
        vendeur: { id: Number(form.vendeurId) },
        client: { id: Number(form.clientId) },
        lignes: lignesValides.map((l) => ({ produit: { id: Number(l.produitId) }, quantite: Number(l.quantite) })),
      })
      showToast('Bon de commande créé avec succès')
      setCreateOpen(false)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const requestAction = (bon, action) => {
    setActionTarget({ ...bon, _action: action })
  }

  const executeAction = async () => {
    if (!actionTarget) return
    setActionLoading(true)
    try {
      if (actionTarget._action === 'valider') {
        await bonCommandeService.valider(actionTarget.id)
        showToast(`Bon #${actionTarget.id} validé`)
      } else if (actionTarget._action === 'annuler') {
        await bonCommandeService.annuler(actionTarget.id)
        showToast(`Bon #${actionTarget.id} annulé`)
      }
      setActionTarget(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePdf = async (bon) => {
    try {
      await downloadFile(`/bons-commande/${bon.id}/export-pdf`, `bon-${bon.id}.pdf`)
      showToast('PDF téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  const handleExport = async () => {
    try {
      await downloadFile('/bons-commande/export-csv', 'bons-commande.csv')
      showToast('Export CSV téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await bonCommandeService.delete(deleting.id)
      showToast('Bon supprimé')
      setDeleting(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des commandes"
        subtitle="Bons de commande, validation et suivi des paiements"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher une commande..." className="w-64" />
            <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
            <Button icon={Plus} onClick={openCreate}>Nouveau bon</Button>
          </>
        }
      />

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filtre === f.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-on-surface-variant border border-outline-variant hover:border-primary/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : bonsFiltres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={ShoppingCart}
            title={q ? 'Aucun résultat' : 'Aucune commande'}
            message={q ? `Aucune commande ne correspond à « ${q} ».` : 'Créez votre premier bon de commande.'}
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
                  <th className="px-6 py-3.5 font-semibold">Vendeur</th>
                  <th className="px-6 py-3.5 font-semibold">Client</th>
                  <th className="px-6 py-3.5 font-semibold">Statut</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Montant</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonsFiltres.map((bon) => {
                  const paye = isPaid(bon)
                  const annule = bon.statut === 'ANNULE'
                  return (
                    <tr key={bon.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">#{bon.id}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{formatDateTime(bon.dateCreation)}</td>
                      <td className="px-6 py-4">{bon.vendeur?.prenom} {bon.vendeur?.nom}</td>
                      <td className="px-6 py-4">{bon.client?.prenom} {bon.client?.nom}</td>
                      <td className="px-6 py-4">
                        <StatusBadge statut={paye ? 'PAYE' : bon.statut} />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{formatAr(bon.montantTotal)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-0.5">
                          <button onClick={() => setDetail(bon)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors" title="Détails">
                            <Eye size={17} />
                          </button>
                          <button onClick={() => handlePdf(bon)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors" title="Télécharger le PDF">
                            <FileText size={17} />
                          </button>
                          {bon.statut === 'EN_ATTENTE' && (
                            <button onClick={() => requestAction(bon, 'valider')} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-green-600 transition-colors" title="Valider">
                              <CheckCircle2 size={17} />
                            </button>
                          )}
                          {!annule && !paye && (
                            <button onClick={() => requestAction(bon, 'annuler')} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-orange-600 transition-colors" title="Annuler">
                              <XCircle size={17} />
                            </button>
                          )}
                          <button onClick={() => setDeleting(bon)} className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors" title="Supprimer">
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

      {/* Modal de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau bon de commande"
        subtitle="Choisissez le vendeur, le client et les produits"
        width="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Vendeur <span className="text-error">*</span></label>
              <select
                value={form.vendeurId}
                onChange={(e) => setForm({ ...form, vendeurId: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                required
              >
                <option value="">Sélectionner un vendeur...</option>
                {vendeurs.map((v) => (
                  <option key={v.id} value={v.id}>{v.prenom} {v.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Client <span className="text-error">*</span></label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                required
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lignes de commande */}
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Produits</label>
            <div className="space-y-2">
              {lignes.map((ligne, idx) => {
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <select
                      value={ligne.produitId}
                      onChange={(e) => {
                        const next = [...lignes]
                        next[idx] = { ...ligne, produitId: e.target.value }
                        setLignes(next)
                      }}
                      className="flex-1 px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                      required
                    >
                      <option value="">Choisir un produit...</option>
                      {produits.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom} — {formatAr(p.prix)} (stock : {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={ligne.quantite}
                      onChange={(e) => {
                        const next = [...lignes]
                        next[idx] = { ...ligne, quantite: e.target.value }
                        setLignes(next)
                      }}
                      className="w-24 px-3 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                      required
                    />
                    <span className="w-28 text-right text-sm font-semibold text-on-surface">{formatAr(montantLigne(ligne))}</span>
                    <button
                      type="button"
                      onClick={() => setLignes((ls) => ls.filter((_, i) => i !== idx))}
                      disabled={lignes.length === 1}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-30"
                      title="Retirer la ligne"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setLignes((ls) => [...ls, { produitId: '', quantite: 1 }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>

          <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-on-surface-variant">Total</span>
            <span className="text-lg font-bold text-primary">{formatAr(totalLignes)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Création...' : 'Créer le bon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal détails */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`Bon de commande #${detail?.id}`}
        subtitle={detail ? formatDateTime(detail.dateCreation) : ''}
        width="max-w-2xl"
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-on-surface-variant mb-1">Vendeur</p>
                  <p className="font-semibold">{detail.vendeur?.prenom} {detail.vendeur?.nom}</p>
                  <p className="text-xs text-on-surface-variant">{detail.vendeur?.rayon?.nom}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1">Client</p>
                  <p className="font-semibold">{detail.client?.prenom} {detail.client?.nom}</p>
                  <p className="text-xs text-on-surface-variant">{detail.client?.telephone}</p>
                </div>
              </div>
              <StatusBadge statut={isPaid(detail) ? 'PAYE' : detail.statut} />
            </div>

            <div className="border border-outline-variant rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left text-on-surface-variant">
                    <th className="px-4 py-2.5 font-semibold">Produit</th>
                    <th className="px-4 py-2.5 font-semibold">Prix</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Qté</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.lignes?.map((l) => (
                    <tr key={l.id} className="border-t border-outline-variant/50">
                      <td className="px-4 py-2.5 font-medium">{l.produit?.nom}</td>
                      <td className="px-4 py-2.5">{formatAr(l.prixUnitaire)}</td>
                      <td className="px-4 py-2.5 text-center">{l.quantite}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatAr(l.sousTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">
                {detail.lignes?.length || 0} article(s)
              </span>
              <span className="text-lg font-bold text-primary">{formatAr(detail.montantTotal)}</span>
            </div>

            <div className="flex justify-end gap-3">
              {detail.statut === 'EN_ATTENTE' && (
                <Button variant="secondary" icon={CheckCircle2} onClick={() => requestAction(detail, 'valider')}>
                  Valider le bon
                </Button>
              )}
              {detail.statut !== 'ANNULE' && !isPaid(detail) && (
                <Button variant="outline" icon={XCircle} onClick={() => requestAction(detail, 'annuler')}>
                  Annuler le bon
                </Button>
              )}
              <Button variant="outline" icon={FileText} onClick={() => handlePdf(detail)}>
                Télécharger PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le bon"
        message={`Voulez-vous vraiment supprimer le bon #${deleting?.id} ? Le stock sera restitué automatiquement.`}
        confirmLabel="Supprimer"
      />

      {/* Confirmation action */}
      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={executeAction}
        loading={actionLoading}
        title={actionTarget?._action === 'valider' ? 'Valider le bon' : 'Annuler le bon'}
        message={
          actionTarget?._action === 'valider'
            ? `Valider le bon #${actionTarget?.id} d'un montant de ${formatAr(actionTarget?.montantTotal)} ?`
            : `Annuler le bon #${actionTarget?.id} ? Le stock sera restitué.`
        }
        confirmLabel={actionTarget?._action === 'valider' ? 'Valider' : "Annuler l'action"}
      />
    </div>
  )
}

export default Commandes
