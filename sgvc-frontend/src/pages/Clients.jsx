import { useEffect, useState } from 'react'
import { Handshake, Plus, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { clientService } from '../services/clientService'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, initials } from '../utils/format'

const initialForm = { nom: '', prenom: '', email: '', telephone: '', adresse: '' }

function Clients() {
  const [clients, setClients] = useState([])
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
      const res = q ? await clientService.rechercher(q) : await clientService.getAll()
      setClients(res.data)
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

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      nom: c.nom,
      prenom: c.prenom,
      email: c.email || '',
      telephone: c.telephone || '',
      adresse: c.adresse || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await clientService.update(editing.id, form)
        showToast('Client modifié avec succès')
      } else {
        await clientService.create(form)
        showToast('Client créé avec succès')
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
      await clientService.delete(deleting.id)
      showToast('Client supprimé')
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
        title="Gestion des clients"
        subtitle="Votre portefeuille clients et leurs coordonnées"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher un client..." className="w-64" />
            <Button icon={Plus} onClick={openCreate}>Nouveau client</Button>
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={Handshake}
            title={q ? 'Aucun résultat' : 'Aucun client'}
            message={q ? `Aucun client ne correspond à « ${q} ».` : 'Ajoutez votre premier client.'}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-outline-variant/60 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm">
                    {initials(`${c.prenom} ${c.nom}`)}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{c.prenom} {c.nom}</p>
                    {c.telephone && (
                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Phone size={11} /> {c.telephone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-on-surface-variant">
                {c.email && (
                  <p className="flex items-center gap-2"><Mail size={15} className="text-green-600" /> {c.email}</p>
                )}
                {c.adresse && (
                  <p className="flex items-center gap-2"><MapPin size={15} className="text-green-600" /> {c.adresse}</p>
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
        title={editing ? 'Modifier le client' : 'Nouveau client'}
        subtitle={editing ? `Modification de ${editing.prenom} ${editing.nom}` : 'Ajoutez un client'}
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
              placeholder="client@exemple.com"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Téléphone</label>
            <input
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="+261 33 00 000 00"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Adresse</label>
            <input
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              placeholder="Lot, quartier, ville..."
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le client'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer le client"
        message={`Voulez-vous vraiment supprimer ${deleting?.prenom} ${deleting?.nom} ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Clients
