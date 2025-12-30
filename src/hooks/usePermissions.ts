import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { useCurrentProjectUser } from './useCurrentProjectUser'

export const usePermissions = () => {
  const { userData } = useAuth()
  const { isMaster } = useProject()
  const { projectUser } = useCurrentProjectUser()

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

  return {
    isAdmin: isAdmin(),
    isUser: isUser(),
    isMaster,
    canManageUsers: canManageUsers(),
    canManageSettings: canManageSettings(),
    canManageProjects: canManageProjects(),
    canManageProjectMembers: canManageProjectMembers(),
    canDeleteDealsAndCompanies: canDeleteDealsAndCompanies(),
  }
}

