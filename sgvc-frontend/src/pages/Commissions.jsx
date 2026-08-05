import { useEffect, useMemo, useState } from 'react'
import { Percent, Plus, FileText, Download, TrendingUp, BadgeDollarSign, Users, Info } from 'lucide-react'
import { commissionService } from '../services/commissionService'
import { vendeurService } from '../services/vendeurService'
import { downloadFile } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../context/ToastContext'
import { errorMessage, formatAr } from '../utils/format'

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function Commissions() {
  const [commissions, setCommissions] = useState([])
  const [vendeurs, setVendeurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreVendeur, setFiltreVendeur] = useState('')
  const [calcOpen, setCalcOpen] = useState(false)
  const [form, setForm] = useState({ vendeurId: '', mois: new Date().getMonth() + 1, annee: new Date().getFullYear() })
  const [calculating, setCalculating] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    try {
      const res = await commissionService.getAll()
      setCommissions(res.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    vendeurService.getAll().then((r) => setVendeurs(r.data)).catch(() => {})
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => (filtreVendeur ? commissions.filter((c) => c.vendeur?.id === Number(filtreVendeur)) : commissions),
    [commissions, filtreVendeur]
  )

  const totalCommissions = filtered.reduce((s, c) => s + Number(c.montantCommission), 0)
  const totalVentes = filtered.reduce((s, c) => s + Number(c.montantVentes), 0)

  const openCalc = () => {
    setForm({ vendeurId: '', mois: new Date().getMonth() + 1, annee: new Date().getFullYear() })
    setCalcOpen(true)
  }

  const handleCalcul = async (e) => {
    e.preventDefault()
    setCalculating(true)
    try {
      const res = await commissionService.calculer(form.vendeurId, Number(form.mois), Number(form.annee))
      showToast(`Commission calculée pour ${res.data.vendeur?.prenom} ${res.data.vendeur?.nom} : ${formatAr(res.data.montantCommission)}`)
      setCalcOpen(false)
      load()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setCalculating(false)
    }
  }

  const handlePdf = async (c) => {
    try {
      await downloadFile(`/commissions/${c.id}/export-pdf`, `commission-${c.id}.pdf`)
      showToast('Bulletin PDF téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  const handleExport = async () => {
    try {
      await downloadFile('/commissions/export-csv', 'commissions.csv')
      showToast('Export CSV téléchargé')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des commissions"
        subtitle="Calcul automatique à 5% du chiffre d'affaires (minimum 200 000 Ar)"
        actions={
          <>
            <select
              value={filtreVendeur}
              onChange={(e) => setFiltreVendeur(e.target.value)}
              className="px-4 py-2 border border-outline-variant rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            >
              <option value="">Tous les vendeurs</option>
              {vendeurs.map((v) => (
                <option key={v.id} value={v.id}>{v.prenom} {v.nom}</option>
              ))}
            </select>
            <Button variant="outline" icon={Download} onClick={handleExport}>Export CSV</Button>
            <Button icon={Plus} onClick={openCalc}>Calculer une commission</Button>
          </>
        }
      />

      {/* Info règle métier */}
      <div className="flex items-start gap-3 bg-primary-container/10 border border-primary/20 rounded-2xl p-4 text-sm text-primary">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p>
          Règle de calcul : <strong>5%</strong> du total des bons <em>validés</em> du vendeur pour le mois.
          Si le résultat est inférieur à <strong>200 000 Ar</strong>, la commission minimale garantie de{' '}
          <strong>200 000 Ar</strong> est appliquée.
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/60 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><Percent size={22} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Commission totale</p>
            <p className="text-xl font-bold">{formatAr(totalCommissions)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/60 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><TrendingUp size={22} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Ventes associées</p>
            <p className="text-xl font-bold">{formatAr(totalVentes)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-outline-variant/60 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-green-50 text-green-600"><Users size={22} /></div>
          <div>
            <p className="text-sm text-on-surface-variant">Commissions calculées</p>
            <p className="text-xl font-bold">{filtered.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/60">
          <EmptyState
            icon={BadgeDollarSign}
            title="Aucune commission"
            message="Calculez une commission pour un vendeur sur une période donnée."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-outline-variant/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-3.5 font-semibold">Vendeur</th>
                  <th className="px-6 py-3.5 font-semibold">Période</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Ventes</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Taux</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Commission</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center text-xs font-bold">
                          {`${c.vendeur?.prenom?.[0] || ''}${c.vendeur?.nom?.[0] || ''}`.toUpperCase()}
                        </div>
                        <span className="font-semibold">{c.vendeur?.prenom} {c.vendeur?.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{MOIS[c.mois - 1]} {c.annee}</td>
                    <td className="px-6 py-4 text-right">{formatAr(c.montantVentes)}</td>
                    <td className="px-6 py-4 text-right text-on-surface-variant">{c.tauxCommission}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">{formatAr(c.montantCommission)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button onClick={() => handlePdf(c)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors" title="Bulletin PDF">
                          <FileText size={17} />
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

      {/* Modal calcul */}
      <Modal
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        title="Calculer une commission"
        subtitle="Choisissez un vendeur et une période"
        width="max-w-md"
      >
        <form onSubmit={handleCalcul} className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Mois <span className="text-error">*</span></label>
              <select
                value={form.mois}
                onChange={(e) => setForm({ ...form, mois: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                required
              >
                {MOIS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Année <span className="text-error">*</span></label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={form.annee}
                onChange={(e) => setForm({ ...form, annee: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                required
              />
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-on-surface-variant">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>Le calcul tient compte uniquement des bons validés. Si une commission existe déjà pour cette période, elle sera recalculée.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setCalcOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={calculating} icon={Percent}>
              {calculating ? 'Calcul en cours...' : 'Calculer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Commissions
