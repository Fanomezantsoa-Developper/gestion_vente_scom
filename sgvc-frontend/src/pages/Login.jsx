import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    try {
      await login(email, motDePasse)
      navigate('/dashboard')
    } catch (err) {
      setErreur('Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant w-full max-w-sm">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">SGVC ERP</h1>

        {erreur && (
          <div className="bg-error-container text-on-error-container text-sm p-3 rounded mb-4">
            {erreur}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-on-surface-variant mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-outline-variant rounded focus:ring-2 focus:ring-secondary outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-on-surface-variant mb-1">Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="w-full px-3 py-2 border border-outline-variant rounded focus:ring-2 focus:ring-secondary outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-on-primary py-2.5 rounded font-semibold hover:opacity-90 transition-all"
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}

export default Login