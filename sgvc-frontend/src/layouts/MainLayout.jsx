import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  Users,
  Handshake,
  Package,
  ShoppingCart,
  Wallet,
  Percent,
  BarChart3,
  UserCog,
  LogOut,
  Search,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/rayons', label: 'Rayons', icon: Store },
  { path: '/vendeurs', label: 'Vendeurs', icon: Users },
  { path: '/clients', label: 'Clients', icon: Handshake },
  { path: '/produits', label: 'Produits', icon: Package },
  { path: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { path: '/paiements', label: 'Paiements', icon: Wallet },
  { path: '/commissions', label: 'Commissions', icon: Percent },
  { path: '/rapports', label: 'Rapports', icon: BarChart3 },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: UserCog },
]

const ROLE_LABEL = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  VENDEUR: 'Vendeur',
  CAISSIER: 'Caissier',
}

function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    if (q) {
      navigate(`/produits?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/produits')
    }
  }

  const role = user?.roles?.[0]
  const roleLabel = ROLE_LABEL[role] || role || 'Utilisateur'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-primary text-on-primary flex flex-col transition-all duration-200 z-40 ${
          collapsed ? 'w-[76px]' : 'w-[280px]'
        }`}
      >
        <div className={`flex items-center gap-3 px-5 h-[72px] shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <img
            src="/logossgvc.png"
            alt="Logo SGVC"
            className="w-10 h-10 rounded-xl bg-white object-contain p-1 shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">SGVC</h1>
              <p className="text-[11px] text-on-primary-container leading-tight truncate">SCOM Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold'
                    : 'text-on-primary-container hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Déconnexion' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-on-primary-container hover:text-white hover:bg-white/5 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm font-semibold whitespace-nowrap">Déconnexion</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-on-primary-container hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            {!collapsed && <span className="text-sm whitespace-nowrap">Réduire le menu</span>}
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${collapsed ? 'ml-[76px]' : 'ml-[280px]'}`}>
        {/* Barre supérieure */}
        <header className="h-[72px] bg-white border-b border-outline-variant flex items-center gap-4 px-6 shrink-0">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-shadow"
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-on-surface leading-tight">
                {user?.nom || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-on-surface-variant leading-tight">{roleLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              {initials(user?.nom || user?.email)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
