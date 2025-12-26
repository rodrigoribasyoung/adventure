import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ContactsPage from '@/features/contacts/pages/ContactsPage'
import CompaniesPage from '@/features/companies/pages/CompaniesPage'
import ServicesPage from '@/features/services/pages/ServicesPage'
import DealsPage from '@/features/deals/pages/DealsPage'
import FunnelsPage from '@/features/funnels/pages/FunnelsPage'
import ReportsPage from '@/features/reports/pages/ReportsPage'
import CustomFieldsPage from '@/features/customFields/pages/CustomFieldsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import UsersPage from '@/features/users/pages/UsersPage'
import AutomationsPage from '@/features/automations/pages/AutomationsPage'
import IntegrationsPage from '@/features/integrations/pages/IntegrationsPage'
import MarketingPage from '@/features/marketing/pages/MarketingPage'
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
        <DealsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/funnels',
    element: (
      <PrivateRoute>
        <FunnelsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <PrivateRoute>
        <ReportsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/marketing',
    element: (
      <PrivateRoute>
        <MarketingPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <PrivateRoute>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/custom-fields',
    element: (
      <PrivateRoute>
        <CustomFieldsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/users',
    element: (
      <PrivateRoute>
        <UsersPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/automations',
    element: (
      <PrivateRoute>
        <AutomationsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/integrations',
    element: (
      <PrivateRoute>
        <IntegrationsPage />
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

