import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ContactsPage from '@/features/contacts/pages/ContactsPage'
import CompaniesPage from '@/features/companies/pages/CompaniesPage'
import ServicesPage from '@/features/services/pages/ServicesPage'
import { ReactNode } from 'react'

// Componente para proteger rotas privadas
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/contacts',
    element: (
      <PrivateRoute>
        <ContactsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/companies',
    element: (
      <PrivateRoute>
        <CompaniesPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/services',
    element: (
      <PrivateRoute>
        <ServicesPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/deals',
    element: (
      <PrivateRoute>
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-white">Deals page - Coming soon</div>
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <PrivateRoute>
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-white">Reports page - Coming soon</div>
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: '/marketing',
    element: (
      <PrivateRoute>
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-white">Marketing page - Coming soon</div>
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <PrivateRoute>
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-white">Settings page - Coming soon</div>
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: '/help',
    element: (
      <PrivateRoute>
        <div className="flex items-center justify-center min-h-screen bg-background-dark">
          <div className="text-white">Help page - Coming soon</div>
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

