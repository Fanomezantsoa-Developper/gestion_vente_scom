import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, Plus, Pencil, Trash2, Download, AlertTriangle, Store } from 'lucide-react'
import { produitService } from '../services/produitService'
import { rayonService } from '../services/rayonService'
import { downloadFile } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, formatAr } from '../utils/format'

const initialForm = { nom: '', reference: '', prix: '', stock: '', description: '', rayonId: '' }

function Produits() {
  const [produits, setProduits] = useState([])
  const [rayons, setRayons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    try {
      const res = q ? await produitService.rechercher(q) : await produitService.getAll()
      setProduits(res.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    rayonService.getAll().then((r) => setRayons(r.data)).catch(() => {})
    setLoading(true)
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const handleSearch = (value) => {
    setQ(value)
    if (value) setSearchParams({ q: value }, { replace: true })
    else setSearchParams({}, { replace: true })
  }

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      nom: p.nom,
      reference: p.reference || '',
      prix: p.prix,
      stock: p.stock,
      description: p.description || '',
      rayonId: p.rayon?.id ?? '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        prix: Number(form.prix),
        stock: Number(form.stock),
        rayon: { id: Number(form.rayonId) },
      }
      if (editing) {
        await produitService.update(editing.id, payload)
        showToast('Produit modifié avec succès')
      } else {
        await produitService.create(payload)
        showToast('Produit créé avec succès')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await produitService.delete(deleting.id)
      showToast('Produit supprimé')
      setDeleting(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await downloadFile('/produits/export-csv', 'produits.csv')
      showToast('Export CSV téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des produits"
        subtitle="Catalogue, prix et niveaux de stock"
        actions={
          <>
            <SearchInput value={q} onChange={handleSearch} placeholder="Rechercher un produit..." className="w-64" />
            <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
            <Button icon={Plus} onClick={openCreate}>Nouveau produit</Button>
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : produits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={Package}
            title={q ? 'Aucun résultat' : 'Aucun produit'}
            message={q ? `Aucun produit ne correspond à « ${q} ».` : 'Ajoutez votre premier produit.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-3.5 font-semibold">Produit</th>
                  <th className="px-6 py-3.5 font-semibold">Référence</th>
                  <th className="px-6 py-3.5 font-semibold">Rayon</th>
                  <th className="px-6 py-3.5 font-semibold">Prix</th>
                  <th className="px-6 py-3.5 font-semibold">Stock</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => {
                  const lowStock = p.stock <= 10
                  return (
                    <tr key={p.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary-container/20 text-primary">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{p.nom}</p>
                            {p.description && <p className="text-xs text-on-surface-variant max-w-[240px] truncate">{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-on-surface-variant">{p.reference || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                          <Store size={14} /> {p.rayon?.nom || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-on-surface">{formatAr(p.prix)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            lowStock ? 'bg-red-50 text-error' : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {lowStock && <AlertTriangle size={13} />}
                          {p.stock} {p.stock <= 1 ? 'unité' : 'unités'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => setDeleting(p)}
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                            title="Supprimer"
                          >
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

      {/* Modal création / édition */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le produit' : 'Nouveau produit'}
        subtitle={editing ? `Modification de « ${editing.nom} »` : 'Ajoutez un produit au catalogue'}
        width="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Nom du produit <span className="text-error">*</span></label>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex : Riz de première qualité"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Référence</label>
            <input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="REF-001"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Rayon <span className="text-error">*</span></label>
            <select
              value={form.rayonId}
              onChange={(e) => setForm({ ...form, rayonId: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            >
              <option value="">Sélectionner...</option>
              {rayons.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Prix (Ar) <span className="text-error">*</span></label>
            <input
              type="number"
              min="1"
              step="any"
              value={form.prix}
              onChange={(e) => setForm({ ...form, prix: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Stock initial <span className="text-error">*</span></label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Courte description (optionnel)"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le produit"
        message={`Voulez-vous vraiment supprimer « ${deleting?.nom} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Produits
