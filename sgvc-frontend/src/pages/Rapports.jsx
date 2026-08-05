import { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Store,
  Users,
  Handshake,
  Package,
  Wallet,
  Percent,
  ShoppingCart,
  PieChart,
  ClipboardList,
  Calendar,
} from 'lucide-react'
import { statistiqueService } from '../services/statistiqueService'
import StatCard from '../components/ui/StatCard'
import SectionCard from '../components/ui/SectionCard'
import PageHeader from '../components/ui/PageHeader'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { formatAr, formatDateTime } from '../utils/format'
import StatusBadge from '../components/ui/StatusBadge'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const STATUT_META = {
  EN_ATTENTE: { label: 'En attente', color: '#f59e0b' },
  VALIDE: { label: 'Validés', color: '#10b981' },
  PAYE: { label: 'Payés', color: '#3b82f6' },
  ANNULE: { label: 'Annulés', color: '#ef4444' },
}

function Rapports() {
  const [stats, setStats] = useState(null)
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [ventes, setVentes] = useState([])
  const [topVendeurs, setTopVendeurs] = useState([])
  const [derniersBons, setDerniersBons] = useState([])
  const [ventesParRayon, setVentesParRayon] = useState([])
  const [repartitionBons, setRepartitionBons] = useState([])
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)

  const annees = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const totalAnnee = ventes.reduce((s, v) => s + v.value, 0)
  const maxCommission = Math.max(...commissions.map((c) => Number(c.montantVentes) || 0), 1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, v, tv, db, vr, rb, cv] = await Promise.all([
          statistiqueService.dashboard(),
          statistiqueService.ventesParMois(annee),
          statistiqueService.meilleursVendeurs(10),
          statistiqueService.derniersBons(8),
          statistiqueService.ventesParRayon(annee),
          statistiqueService.repartitionBons(),
          statistiqueService.commissionsParVendeur(),
        ])
        setStats(s.data)
        setVentes(
          Array.from({ length: 12 }, (_, i) => {
            const m = v.data.find((item) => item.mois === i + 1)
            return { label: MOIS[i], value: m ? Number(m.montant) : 0 }
          })
        )
        setTopVendeurs(tv.data)
        setDerniersBons(db.data)
        setVentesParRayon(vr.data)
        setRepartitionBons(
          rb.data
            .map((r) => ({
              ...r,
              label: STATUT_META[r.statut]?.label || r.statut,
              color: STATUT_META[r.statut]?.color || '#64748b',
            }))
            .filter((r) => r.nombre > 0)
        )
        setCommissions(cv.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [annee])

  if (loading) return <Spinner label="Chargement des rapports..." />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BarChart3}
        variant="purple"
        title="Rapports & statistiques"
        subtitle="Analyse des performances commerciales de l'année"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant">
              <Calendar size={15} /> Année :
            </span>
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/60">
              {annees.map((a) => (
                <button
                  key={a}
                  onClick={() => setAnnee(a)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    a === annee ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* KPI globaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Chiffre d'affaires" value={formatAr(totalAnnee)} sub={`Ventes validées ${annee}`} variant="primary" />
        <StatCard icon={Percent} label="Commissions versées" value={formatAr(stats?.montantTotalCommissions)} sub="5% des ventes (min 200 000 Ar)" variant="purple" />
        <StatCard icon={ShoppingCart} label="Bons de commande" value={stats?.nbBons ?? 0} sub={`${stats?.nbBonsEnAttente ?? 0} en attente`} variant="blue" />
        <StatCard icon={Package} label="Produits en stock faible" value={stats?.nbProduitsStockFaible ?? 0} sub="Sous le seuil de 10" variant="red" />
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Store, label: 'Rayons', value: stats?.nbRayons, chip: 'bg-primary-container text-primary' },
          { icon: Users, label: 'Vendeurs', value: stats?.nbVendeurs, chip: 'bg-blue-100 text-blue-600' },
          { icon: Handshake, label: 'Clients', value: stats?.nbClients, chip: 'bg-teal-100 text-teal-600' },
          { icon: Package, label: 'Produits', value: stats?.nbProduits, chip: 'bg-orange-100 text-orange-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-outline-variant/60 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className={`p-2.5 rounded-xl ${c.chip} shrink-0`}><Icon size={20} /></div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-on-surface leading-tight">{c.value ?? 0}</p>
                <p className="text-xs text-on-surface-variant truncate">{c.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Évolution des ventes */}
      <SectionCard
        icon={TrendingUp}
        variant="primary"
        title={`Évolution des ventes ${annee}`}
        subtitle="Bons validés par mois, en Ariary"
        actions={
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">Total {annee}</p>
            <p className="text-xl font-bold text-primary">{formatAr(totalAnnee)}</p>
          </div>
        }
      >
        <LineChart data={ventes} height={280} />
      </SectionCard>

      {/* Donuts : ventes par rayon + répartition des bons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          icon={PieChart}
          variant="blue"
          title="Ventes par rayon"
          subtitle={`Répartition du chiffre d'affaires ${annee}`}
        >
          {ventesParRayon.length === 0 ? (
            <EmptyState icon={Store} title="Aucune vente" message="Les ventes par rayon apparaîtront ici dès les premières ventes validées." />
          ) : (
            <DonutChart
              data={ventesParRayon.map((r) => ({ label: r.nom, value: Number(r.montant) }))}
              height={230}
            />
          )}
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          variant="orange"
          title="Répartition des bons"
          subtitle="Par statut (en attente, validé, payé, annulé)"
        >
          {repartitionBons.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Aucun bon" />
          ) : (
            <DonutChart
              data={repartitionBons.map((r) => ({ label: r.label, value: r.nombre, color: r.color }))}
              height={230}
              formatValue={(n) => `${n} bon(s)`}
            />
          )}
        </SectionCard>
      </div>

      {/* Classement vendeurs + commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          icon={Trophy}
          variant="amber"
          title="Classement des vendeurs"
          subtitle="Montant des ventes validées"
          className="lg:col-span-2"
        >
          {topVendeurs.length === 0 ? (
            <EmptyState icon={Users} title="Aucune donnée" />
          ) : (
            <BarChart
              data={topVendeurs.map((v) => ({
                label: v.nomComplet?.split(' ').slice(-1)[0] || 'Vendeur',
                value: Number(v.montantVentes),
              }))}
              height={260}
            />
          )}
        </SectionCard>

        <SectionCard
          icon={Percent}
          variant="purple"
          title="Commissions par vendeur"
          subtitle="Total commissionné"
        >
          {commissions.length === 0 ? (
            <EmptyState icon={Percent} title="Aucune commission" />
          ) : (
            <div className="space-y-4">
              {commissions.map((c) => (
                <div key={c.vendeurId}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-on-surface truncate mr-2">{c.nomComplet}</span>
                    <span className="font-bold text-primary shrink-0">{formatAr(c.montantVentes)}</span>
                  </div>
                  <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${(Number(c.montantVentes) / maxCommission) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Derniers bons */}
      <SectionCard
        icon={ShoppingCart}
        variant="green"
        title="Dernières commandes"
        subtitle="Les 8 bons les plus récents"
      >
        {derniersBons.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Aucun bon" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                  <th className="pb-3 font-medium">N°</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Vendeur</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {derniersBons.map((bon) => (
                  <tr key={bon.id} className="border-b border-outline-variant/50 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 font-semibold text-primary">#{bon.id}</td>
                    <td className="py-3">{formatDateTime(bon.dateCreation)}</td>
                    <td className="py-3">{bon.vendeur?.prenom} {bon.vendeur?.nom}</td>
                    <td className="py-3">{bon.client?.prenom} {bon.client?.nom}</td>
                    <td className="py-3"><StatusBadge statut={bon.statut} /></td>
                    <td className="py-3 text-right font-semibold">{formatAr(bon.montantTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

export default Rapports
