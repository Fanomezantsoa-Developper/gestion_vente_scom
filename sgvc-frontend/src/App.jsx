import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vendeurs from './pages/Vendeurs'
import Clients from './pages/Clients'
import Produits from './pages/Produits'
import Commandes from './pages/Commandes'
import Commissions from './pages/Commissions'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendeurs" element={<Vendeurs />} />
            <Route path="clients" element={<Clients />} />
            <Route path="produits" element={<Produits />} />
            <Route path="commandes" element={<Commandes />} />
            <Route path="commissions" element={<Commissions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App