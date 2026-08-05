import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Percent,
  Clock,
  AlertTriangle,
  Store,
  Users,
  Handshake,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'
import { statistiqueService } from '../services/statistiqueService'
import StatCard from '../components/ui/StatCard'
import SectionCard from '../components/ui/SectionCard'
import PageHeader from '../components/ui/PageHeader'
import StatusBadge from '../components/ui/StatusBadge'
import BarChart from '../components/charts/BarChart'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { formatAr, formatDateTime } from '../utils/format'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [ventes, setVentes] = useState([])
  const [topVendeurs, setTopVendeurs] = useState([])
  const [derniersBons, setDerniersBons] = useState([])
  const [loading, setLoading] = useState(true)
  const annee = new Date().getFullYear()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, v, tv, db] = await Promise.all([
          statistiqueService.dashboard(),
          statistiqueService.ventesParMois(annee),
          statistiqueService.meilleursVendeurs(5),
          statistiqueService.derniersBons(6),
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
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [annee])

  if (loading) return <Spinner label="Chargement du tableau de bord..." />

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        icon={LayoutDashboard}
        variant="primary"
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité SGVC"
      />

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Chiffre d'affaires"
          value={formatAr(stats?.montantTotalVentes)}
          sub={`${stats?.nbBons ?? 0} bons de commande`}
          variant="primary"
        />
        <StatCard
          icon={Percent}
          label="Commissions totales"
          value={formatAr(stats?.montantTotalCommissions)}
          sub="Taux fixe 5% (min 200 000 Ar)"
          variant="purple"
        />
        <StatCard
          icon={Clock}
          label="Bons en attente"
          value={stats?.nbBonsEnAttente ?? 0}
          sub="À valider ou payer"
          variant="orange"
        />
        <StatCard
          icon={AlertTriangle}
          label="Stocks faibles"
          value={stats?.nbProduitsStockFaible ?? 0}
          sub="Produits sous le seuil"
          variant="red"
        />
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { icon: Store, label: 'Rayons', value: stats?.nbRayons, to: '/rayons' },
          { icon: Users, label: 'Vendeurs', value: stats?.nbVendeurs, to: '/vendeurs' },
          { icon: Handshake, label: 'Clients', value: stats?.nbClients, to: '/clients' },
          { icon: Package, label: 'Produits', value: stats?.nbProduits, to: '/produits' },
          { icon: ShoppingCart, label: 'Bons', value: stats?.nbBons, to: '/commandes' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.label}
              to={c.to}
              className="bg-white rounded-2xl p-4 border border-outline-variant/60 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-surface-container text-primary group-hover:bg-primary-container">
                  <Icon size={20} />
                </div>
                <ArrowRight size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-on-surface">{c.value ?? 0}</p>
              <p className="text-sm text-on-surface-variant">{c.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Graphique + Top vendeurs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          icon={TrendingUp}
          variant="primary"
          title={`Ventes ${annee}`}
          subtitle="Montants des bons validés par mois"
          actions={
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              <TrendingUp size={16} className="text-primary" />
              <span>Année {annee}</span>
            </div>
          }
          className="lg:col-span-2"
        >
          <BarChart data={ventes} height={250} />
        </SectionCard>

        <SectionCard
          icon={Users}
          variant="amber"
          title="Top vendeurs"
          subtitle="Meilleures performances"
        >
          {topVendeurs.length === 0 ? (
            <EmptyState icon={Users} title="Aucune donnée" message="Les meilleurs vendeurs apparaîtront ici dès les premières ventes." />
          ) : (
            <div className="space-y-4">
              {topVendeurs.map((v, i) => (
                <div key={v.vendeurId} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0
                        ? 'bg-amber-100 text-amber-700'
                        : i === 1
                        ? 'bg-slate-100 text-slate-600'
                        : i === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface truncate">{v.nomComplet}</p>
                    <p className="text-xs text-on-surface-variant">{v.nbBons} bon(s)</p>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">{formatAr(v.montantVentes)}</p>
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
        title="Derniers bons de commande"
        subtitle="Les 6 commandes les plus récentes"
        actions={
          <Link to="/commandes" className="text-sm font-semibold text-secondary hover:underline inline-flex items-center gap-1">
            Tout voir <ArrowRight size={16} />
          </Link>
        }
      >
        {derniersBons.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Aucun bon" message="Créez votre premier bon de commande pour le voir ici." />
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

export default Dashboard
