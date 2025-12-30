import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const usePermissions = () => {
  const { userData } = useAuth()
  const { isMaster } = useProject()

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

  return {
    isAdmin: isAdmin(),
    isUser: isUser(),
    isMaster,
    canManageUsers: canManageUsers(),
    canManageSettings: canManageSettings(),
    canManageProjects: canManageProjects(),
    canManageProjectMembers: canManageProjectMembers(),
  }
}

