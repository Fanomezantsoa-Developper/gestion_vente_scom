import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rayons from './pages/Rayons'
import Vendeurs from './pages/Vendeurs'
import Clients from './pages/Clients'
import Produits from './pages/Produits'
import Commandes from './pages/Commandes'
import Paiements from './pages/Paiements'
import Commissions from './pages/Commissions'
import Rapports from './pages/Rapports'
import Utilisateurs from './pages/Utilisateurs'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="rayons" element={<Rayons />} />
              <Route path="vendeurs" element={<Vendeurs />} />
              <Route path="clients" element={<Clients />} />
              <Route path="produits" element={<Produits />} />
              <Route path="commandes" element={<Commandes />} />
              <Route path="paiements" element={<Paiements />} />
              <Route path="commissions" element={<Commissions />} />
              <Route path="rapports" element={<Rapports />} />
              <Route
                path="utilisateurs"
                element={
                  <AdminRoute>
                    <Utilisateurs />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
