import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import WelcomePage from '@/features/auth/pages/WelcomePage'
import CRMPage from '@/features/home/pages/CRMPage'
import HomePage from '@/features/home/pages/HomePage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ContactsPage from '@/features/contacts/pages/ContactsPage'
import ContactDetailPage from '@/features/contacts/pages/ContactDetailPage'
import CompaniesPage from '@/features/companies/pages/CompaniesPage'
import CompanyDetailPage from '@/features/companies/pages/CompanyDetailPage'
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
import { OAuthCallbackPage } from '@/features/integrations/pages/OAuthCallbackPage'
import ImportsPage from '@/features/settings/pages/ImportsPage'
import ActivityHistoryPage from '@/features/activityHistory/pages/ActivityHistoryPage'
import MarketingPage from '@/features/marketing/pages/MarketingPage'
import TasksPage from '@/features/tasks/pages/TasksPage'
import ProjectsPage from '@/features/projects/pages/ProjectsPage'
import ProjectMembersPage from '@/features/projectMembers/pages/ProjectMembersPage'
import ProposalsPage from '@/features/proposals/pages/ProposalsPage'
import TenantsPage from '@/features/tenants/pages/TenantsPage'
import DocumentationPage from '@/features/documentation/pages/DocumentationPage'
import ClientReportsPage from '@/features/clientReports/pages/ClientReportsPage'
import ClientDashboardPage from '@/features/clientReports/pages/ClientDashboardPage'
import { ReactNode } from 'react'

// Wrapper para usar useLocation dentro do PrivateRoute
const PrivateRouteWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LOADING...</div>
      </div>
    )
  }

  if (!currentUser) {
    // Salvar a rota de destino para redirecionar após login
    const destination = location.pathname + location.search
    if (destination !== '/login') {
      sessionStorage.setItem('loginRedirect', destination)
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para proteger rotas privadas
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  return <PrivateRouteWrapper>{children}</PrivateRouteWrapper>
}

export const router = createBrowserRouter([
  {
    path: '/crm',
    element: <CRMPage />,
  },
  {
    path: '/login',
    element: <WelcomePage />,
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
    path: '/contacts/:id',
    element: (
      <PrivateRoute>
        <ContactDetailPage />
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
    path: '/companies/:id',
    element: (
      <PrivateRoute>
        <CompanyDetailPage />
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
    path: '/proposals',
    element: (
      <PrivateRoute>
        <ProposalsPage />
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
    path: '/auth/google-ads/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/auth/google-analytics/callback',
    element: <OAuthCallbackPage />,
  },
  {
    path: '/auth/meta-ads/callback',
    element: <OAuthCallbackPage />,
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
    path: '/settings/activity-history',
    element: (
      <PrivateRoute>
        <ActivityHistoryPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/tenants',
    element: (
      <PrivateRoute>
        <TenantsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/help',
    element: (
      <PrivateRoute>
        <DocumentationPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings/documentation',
    element: (
      <PrivateRoute>
        <DocumentationPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/client-reports',
    element: (
      <PrivateRoute>
        <ClientReportsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/client-reports/:projectId',
    element: (
      <PrivateRoute>
        <ClientDashboardPage />
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

