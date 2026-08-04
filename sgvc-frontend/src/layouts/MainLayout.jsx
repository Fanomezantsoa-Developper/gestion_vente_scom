import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Percent, ShoppingCart, Package, Handshake, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'


const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendeurs', label: 'Vendeurs', icon: Users },
  { path: '/clients', label: 'Clients', icon: Handshake },
  { path: '/produits', label: 'Produits', icon: Package },
  { path: '/commandes', label: 'Commandes', icon: ShoppingCart },
  { path: '/commissions', label: 'Commissions', icon: Percent },
]


function MainLayout() {
  const location = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
  logout()
  navigate('/login')
}
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-primary text-on-primary flex flex-col py-6">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold uppercase tracking-wider">SGVC Admin</h1>
          <p className="text-sm opacity-70">SCOM Management</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary'
                    : 'text-on-primary-container hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-6 pt-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center gap-2 text-on-primary-container hover:text-white transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-semibold">Déconnexion</span>
        </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 ml-[280px]">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout