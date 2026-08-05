import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = async (email, motDePasse) => {
    const response = await api.post('/auth/login', { email, motDePasse })
    const { token, email: userEmail, nom, roles } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ email: userEmail, nom, roles }))
    setUser({ email: userEmail, nom, roles })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}