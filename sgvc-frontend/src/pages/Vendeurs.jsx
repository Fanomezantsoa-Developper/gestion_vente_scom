import { useEffect, useState } from 'react'
import { Users, Plus, Pencil, Trash2, Mail, Phone, Store } from 'lucide-react'
import { vendeurService } from '../services/vendeurService'
import { rayonService } from '../services/rayonService'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, initials } from '../utils/format'

const initialForm = { nom: '', prenom: '', email: '', telephone: '', rayonId: '' }

function Vendeurs() {
  const [vendeurs, setVendeurs] = useState([])
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
      const res = q ? await vendeurService.rechercher(q) : await vendeurService.getAll()
      setVendeurs(res.data)
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

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (v) => {
    setEditing(v)
    setForm({
      nom: v.nom,
      prenom: v.prenom,
      email: v.email || '',
      telephone: v.telephone || '',
      rayonId: v.rayon?.id ?? '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, rayon: { id: Number(form.rayonId) } }
      if (editing) {
        await vendeurService.update(editing.id, payload)
        showToast('Vendeur modifié avec succès')
      } else {
        await vendeurService.create(payload)
        showToast('Vendeur créé avec succès')
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
      await vendeurService.delete(deleting.id)
      showToast('Vendeur supprimé')
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
        title="Gestion des vendeurs"
        subtitle="Vos commerciaux et leurs rayons d'affectation"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher un vendeur..." className="w-64" />
            <Button icon={Plus} onClick={openCreate}>Nouveau vendeur</Button>
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : vendeurs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={Users}
            title={q ? 'Aucun résultat' : 'Aucun vendeur'}
            message={q ? `Aucun vendeur ne correspond à « ${q} ».` : 'Ajoutez votre premier vendeur.'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendeurs.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-outline-variant/60 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                    {initials(`${v.prenom} ${v.nom}`)}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{v.prenom} {v.nom}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
                      <Store size={12} /> {v.rayon?.nom || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => setDeleting(v)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-on-surface-variant">
                {v.email && (
                  <p className="flex items-center gap-2"><Mail size={15} className="text-primary" /> {v.email}</p>
                )}
                {v.telephone && (
                  <p className="flex items-center gap-2"><Phone size={15} className="text-primary" /> {v.telephone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal création / édition */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le vendeur' : 'Nouveau vendeur'}
        subtitle={editing ? `Modification de ${editing.prenom} ${editing.nom}` : 'Ajoutez un vendeur à votre équipe'}
        width="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Prénom <span className="text-error">*</span></label>
            <input
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Nom <span className="text-error">*</span></label>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vendeur@exemple.com"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Téléphone</label>
            <input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="+261 32 00 000 00"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Rayon <span className="text-error">*</span></label>
            <select
              value={form.rayonId}
              onChange={(e) => setForm({ ...form, rayonId: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            >
              <option value="">Sélectionner un rayon...</option>
              {rayons.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le vendeur'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le vendeur"
        message={`Voulez-vous vraiment supprimer ${deleting?.prenom} ${deleting?.nom} ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Vendeurs
