import { useAuth } from '@/contexts/AuthContext'

export const usePermissions = () => {
  const { userData } = useAuth()

  const isAdmin = () => {
    return userData?.role === 'admin'
  }

  const isUser = () => {
    return userData?.role === 'user' || userData?.role === 'admin'
  }

  const canManageUsers = () => {
    return isAdmin()
  }

  const canManageSettings = () => {
    return isAdmin()
  }

  return {
    isAdmin: isAdmin(),
    isUser: isUser(),
    canManageUsers: canManageUsers(),
    canManageSettings: canManageSettings(),
  }
}

