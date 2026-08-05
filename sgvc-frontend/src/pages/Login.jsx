import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, TrendingUp, Store, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    try {
      await login(email, motDePasse)
      navigate('/dashboard')
    } catch (err) {
      setErreur(err?.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Panneau gauche : branding */}
      <div className="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-[28rem] h-[28rem] rounded-full bg-secondary-container/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img
            src="/logossgvc.png"
            alt="Logo SGVC"
            className="w-11 h-11 rounded-2xl bg-white object-contain p-1"
          />
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">SGVC</h1>
            <p className="text-sm text-on-primary-container">SCOM Management</p>
          </div>
        </div>

        <div className="relative text-white space-y-8">
          <h2 className="text-4xl font-bold leading-tight max-w-md">
            Pilotez vos ventes et commissions en toute simplicité
          </h2>
          <p className="text-on-primary-container max-w-md leading-relaxed">
            Gérez vos rayons, vendeurs, clients et bons de commande depuis une interface moderne et
            sécurisée, avec suivi des paiements et calcul automatique des commissions.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { icon: Store, label: 'Rayons', sub: 'Gestion' },
              { icon: TrendingUp, label: 'Ventes', sub: 'Suivi' },
              { icon: BarChart3, label: 'Rapports', sub: 'Statistiques' },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <Icon size={20} className="text-secondary-container mb-2" />
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-on-primary-container">{f.sub}</p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="relative text-xs text-on-primary-container">© {new Date().getFullYear()} SGVC — Système de Gestion des Ventes & Commissions</p>
      </div>

      {/* Panneau droit : formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img
              src="/logossgvc.png"
              alt="Logo SGVC"
              className="w-11 h-11 rounded-2xl bg-white object-contain p-1"
            />
            <div>
              <h1 className="text-xl font-bold text-primary leading-tight">SGVC</h1>
              <p className="text-sm text-on-surface-variant">SCOM Management</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant">
            <h2 className="text-2xl font-bold text-on-surface">Connexion</h2>
            <p className="text-on-surface-variant text-sm mt-1 mb-8">Accédez à votre espace de gestion</p>

            {erreur && (
              <div className="bg-error-container text-error text-sm p-3 rounded-xl mb-5 font-medium">
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Adresse email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-shadow"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-shadow"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-outline-variant text-center">
              <p className="text-xs text-on-surface-variant">
                Compte démo : <span className="font-semibold text-on-surface">admin@sgvc.mg</span> /{' '}
                <span className="font-semibold text-on-surface">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
