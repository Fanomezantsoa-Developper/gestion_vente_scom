import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protège une page en exigeant le rôle ADMIN
function AdminRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.roles?.includes('ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute
