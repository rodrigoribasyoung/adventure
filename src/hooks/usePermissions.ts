import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { useCurrentProjectUser } from './useCurrentProjectUser'

export const usePermissions = () => {
  const { userData } = useAuth()
  const { isMaster: isMasterFromProject } = useProject()
  const { projectUser } = useCurrentProjectUser()

  // Calcular isMaster diretamente do userData para garantir que está atualizado
  const isMaster = userData?.isMaster === true || isMasterFromProject

  // Debug: log dos valores de permissão
  console.log('[usePermissions] Debug:', {
    userData: userData ? { id: userData.id, email: userData.email, isMaster: userData.isMaster } : null,
    isMasterFromProject,
    isMasterFromUserData: userData?.isMaster === true,
    finalIsMaster: isMaster,
  })

  const isAdmin = () => {
    return userData?.role === 'admin' || isMaster
  }

  const isUser = () => {
    return userData?.role === 'user' || userData?.role === 'admin' || isMaster
  }

  const canManageUsers = () => {
    return isMaster || isAdmin()
  }

  const canManageSettings = () => {
    return isMaster || isAdmin()
  }

  const canManageProjects = () => {
    return isMaster
  }

  const canManageProjectMembers = () => {
    return isMaster
  }

  // Permissão para excluir deals e companies - apenas owner e admin
  const canDeleteDealsAndCompanies = () => {
    if (isMaster) return true
    const role = projectUser?.role
    return role === 'owner' || role === 'admin'
  }

  // Permissão para acessar relatórios de clientes - apenas master
  const canAccessClientReports = () => {
    return isMaster
  }

  // Permissão para gerenciar integrações de clientes - apenas master
  const canManageClientIntegrations = () => {
    return isMaster
  }

  return {
    isAdmin: isAdmin(),
    isUser: isUser(),
    isMaster,
    canManageUsers: canManageUsers(),
    canManageSettings: canManageSettings(),
    canManageProjects: canManageProjects(),
    canManageProjectMembers: canManageProjectMembers(),
    canDeleteDealsAndCompanies: canDeleteDealsAndCompanies(),
    canAccessClientReports: canAccessClientReports(),
    canManageClientIntegrations: canManageClientIntegrations(),
  }
}

