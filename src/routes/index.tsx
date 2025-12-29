import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import WelcomePage from '@/features/auth/pages/WelcomePage'
import LoginPage from '@/features/auth/pages/LoginPage'
import HomePage from '@/features/home/pages/HomePage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ContactsPage from '@/features/contacts/pages/ContactsPage'
import CompaniesPage from '@/features/companies/pages/CompaniesPage'
import ServicesPage from '@/features/services/pages/ServicesPage'
import DealsPage from '@/features/deals/pages/DealsPage'
import DealDetailPage from '@/features/deals/pages/DealDetailPage'
import FunnelsPage from '@/features/funnels/pages/FunnelsPage'
import ReportsPage from '@/features/reports/pages/ReportsPage'
import CustomFieldsPage from '@/features/customFields/pages/CustomFieldsPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import UsersPage from '@/features/users/pages/UsersPage'
import AutomationsPage from '@/features/automations/pages/AutomationsPage'
import IntegrationsPage from '@/features/integrations/pages/IntegrationsPage'
import ImportsPage from '@/features/settings/pages/ImportsPage'
import MarketingPage from '@/features/marketing/pages/MarketingPage'
import TasksPage from '@/features/tasks/pages/TasksPage'
import ProjectsPage from '@/features/projects/pages/ProjectsPage'
import ProjectMembersPage from '@/features/projectMembers/pages/ProjectMembersPage'
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
    return <Navigate to="/welcome" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/dashboard',
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
    path: '/deals/:id',
    element: (
      <PrivateRoute>
        <DealDetailPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/funnels',
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
    path: '/tasks',
    element: (
      <PrivateRoute>
        <TasksPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <PrivateRoute>
        <ProjectsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/project-members',
    element: (
      <PrivateRoute>
        <ProjectMembersPage />
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
    path: '/settings/imports',
    element: (
      <PrivateRoute>
        <ImportsPage />
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
    element: <Navigate to="/welcome" replace />,
  },
])

