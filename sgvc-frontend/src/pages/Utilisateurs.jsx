import { useEffect, useState } from 'react'
import { UserCog, Plus, Pencil, Trash2, ShieldCheck, KeyRound } from 'lucide-react'
import { utilisateurService, roleService } from '../services/utilisateurService'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, initials } from '../utils/format'
import { useAuth } from '../context/AuthContext'

const ROLE_STYLE = {
  ADMIN: 'bg-red-50 text-red-700',
  MANAGER: 'bg-blue-50 text-blue-700',
  VENDEUR: 'bg-green-50 text-green-700',
  CAISSIER: 'bg-orange-50 text-orange-700',
}

const initialForm = { nom: '', email: '', motDePasse: '', roleIds: [] }

function Utilisateurs() {
  const { user } = useAuth()
  const [utilisateurs, setUtilisateurs] = useState([])
  const [roles, setRoles] = useState([])
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
      const res = q ? await utilisateurService.rechercher(q) : await utilisateurService.getAll()
      setUtilisateurs(res.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    roleService.getAll().then((r) => setRoles(r.data)).catch(() => {})
    setLoading(true)
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...initialForm, roleIds: roles.length ? [roles[0].id] : [] })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setEditing(u)
    setForm({
      nom: u.nom,
      email: u.email,
      motDePasse: '',
      actif: u.actif,
      roleIds: u.roles || [],
    })
    setModalOpen(true)
  }

  const toggleRole = (id) => {
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(id) ? f.roleIds.filter((r) => r !== id) : [...f.roleIds, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await utilisateurService.update(editing.id, {
          nom: form.nom,
          email: form.email,
          actif: form.actif,
          roleIds: form.roleIds,
          ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
        })
        showToast('Utilisateur modifié avec succès')
      } else {
        await utilisateurService.create({
          nom: form.nom,
          email: form.email,
          motDePasse: form.motDePasse,
          roleIds: form.roleIds,
        })
        showToast('Utilisateur créé avec succès')
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
      await utilisateurService.delete(deleting.id)
      showToast('Utilisateur supprimé')
      setDeleting(null)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const currentUserEmail = user?.email

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Comptes d'accès, rôles et permissions"
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Rechercher un utilisateur..." className="w-64" />
            <Button icon={Plus} onClick={openCreate}>Nouvel utilisateur</Button>
          </>
        }
      />

      {loading ? (
        <Spinner />
      ) : utilisateurs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState icon={UserCog} title={q ? 'Aucun résultat' : 'Aucun utilisateur'} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-3.5 font-semibold">Utilisateur</th>
                  <th className="px-6 py-3.5 font-semibold">Rôles</th>
                  <th className="px-6 py-3.5 font-semibold">Statut</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-sm font-bold">
                          {initials(u.nom)}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">
                            {u.nom}
                            {u.email === currentUserEmail && (
                              <span className="ml-2 text-xs font-medium text-secondary">(vous)</span>
                            )}
                          </p>
                          <p className="text-xs text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles?.map((r) => (
                          <span key={r} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLE[r] || 'bg-gray-100 text-gray-700'}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.actif ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => setDeleting(u)}
                          disabled={u.email === currentUserEmail}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={u.email === currentUserEmail ? 'Impossible de se supprimer soi-même' : 'Supprimer'}
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
        title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        subtitle={editing ? `Modification de ${editing.nom}` : 'Créez un compte d\'accès'}
        width="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Nom complet <span className="text-error">*</span></label>
            <input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex : Rabe Jean"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Email <span className="text-error">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="utilisateur@sgvc.mg"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              {editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} {!editing && <span className="text-error">*</span>}
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                minLength={editing ? undefined : 6}
                value={form.motDePasse}
                onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                placeholder={editing ? 'Laisser vide pour ne pas changer' : '6 caractères minimum'}
                className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                required={!editing}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Rôles <span className="text-error">*</span></label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRole(r.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    form.roleIds.includes(r.id)
                      ? 'border-primary bg-primary text-white'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <ShieldCheck size={15} /> {r.nom}
                </button>
              ))}
            </div>
            {form.roleIds.length === 0 && (
              <p className="text-xs text-error mt-1.5">Sélectionnez au moins un rôle</p>
            )}
          </div>
          {editing && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-on-surface">Compte actif</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, actif: !form.actif })}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.actif ? 'bg-green-500' : 'bg-outline-variant'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.actif ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={saving || form.roleIds.length === 0}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer l'utilisateur"
        message={`Voulez-vous vraiment supprimer le compte de « ${deleting?.nom} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default Utilisateurs
