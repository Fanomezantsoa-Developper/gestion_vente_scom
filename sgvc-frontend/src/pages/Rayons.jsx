import { useEffect, useState } from 'react'
import { Store, Plus, Pencil, Trash2, Package } from 'lucide-react'
import { rayonService } from '../services/rayonService'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../utils/format'

const initialForm = { nom: '', description: '' }

function Rayons() {
  const [rayons, setRayons] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    try {
      const res = q ? await rayonService.rechercher(q) : await rayonService.getAll()
      setRayons(res.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (rayon) => {
    setEditing(rayon)
    setForm({ nom: rayon.nom, description: rayon.description || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await rayonService.update(editing.id, form)
        showToast('Rayon modifié avec succès')
      } else {
        await rayonService.create(form)
        showToast('Rayon créé avec succès')
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
      await rayonService.delete(deleting.id)
      showToast('Rayon supprimé')
      setDeleting(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = rayons.filter(
    (r) => !q || (r.nom || '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des rayons"
        subtitle="Organisez votre magasin par catégories de produits"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher un rayon..." className="w-64" />
            <Button icon={Plus} onClick={openCreate}>Nouveau rayon</Button>
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={Store}
            title={q ? 'Aucun résultat' : 'Aucun rayon'}
            message={q ? `Aucun rayon ne correspond à « ${q} ».` : 'Créez votre premier rayon pour commencer.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-3.5 font-semibold">Nom</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold">Produits</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rayon) => (
                  <tr key={rayon.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary-container/20 text-primary">
                          <Store size={18} />
                        </div>
                        <span className="font-semibold text-on-surface">{rayon.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{rayon.description || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                        <Package size={15} /> {rayon.nbProduits ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(rayon)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => setDeleting(rayon)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création / édition */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le rayon' : 'Nouveau rayon'}
        subtitle={editing ? `Modification de « ${editing.nom} »` : 'Ajoutez un rayon à votre magasin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Nom du rayon <span className="text-error">*</span>
            </label>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex : Alimentation"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Courte description du rayon (optionnel)"
              rows={3}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le rayon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation suppression */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le rayon"
        message={`Voulez-vous vraiment supprimer le rayon « ${deleting?.nom} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Rayons
