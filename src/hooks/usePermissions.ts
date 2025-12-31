import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { useCurrentProjectUser } from './useCurrentProjectUser'

export const usePermissions = () => {
  const { userData } = useAuth()
  const { isMaster } = useProject()
  const { projectUser } = useCurrentProjectUser()

  // Debug: log dos valores de permissão
  console.log('[usePermissions] Debug:', {
    userData: userData ? { id: userData.id, email: userData.email, isMaster: userData.isMaster } : null,
    isMasterFromProject: isMaster,
    isMasterFromUserData: userData?.isMaster === true,
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
  // Verifica tanto isMaster do ProjectContext quanto diretamente do userData
  const canAccessClientReports = () => {
    const masterFromContext = isMaster
    const masterFromUserData = userData?.isMaster === true
    const result = masterFromContext || masterFromUserData
    
    console.log('[usePermissions] canAccessClientReports:', {
      masterFromContext,
      masterFromUserData,
      result,
    })
    
    return result
  }

  // Permissão para gerenciar integrações de clientes - apenas master
  const canManageClientIntegrations = () => {
    return isMaster || userData?.isMaster === true
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

