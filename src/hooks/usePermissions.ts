import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { useCurrentProjectUser } from './useCurrentProjectUser'

export const usePermissions = () => {
  const { userData } = useAuth()
  const { isMaster: isMasterFromProject } = useProject()
  const { projectUser } = useCurrentProjectUser()

  // Verificar se é Desenvolvedor (nível 0 - acesso total)
  const isDeveloper = userData?.userType === 'developer'
  
  // Verificar se é Proprietário (nível 1 - acesso total)
  const isOwner = userData?.userType === 'owner'
  
  // Verificar se é Desenvolvedor ou Proprietário (acesso total)
  const isDeveloperOrOwner = isDeveloper || isOwner
  
  // Calcular isMaster (compatibilidade com código antigo + nova hierarquia)
  // isMaster = developer, owner, ou isMaster antigo
  const isMaster = isDeveloperOrOwner || userData?.isMaster === true || isMasterFromProject

  // Debug: log dos valores de permissão
  console.log('[usePermissions] Debug:', {
    userData: userData ? { 
      id: userData.id, 
      email: userData.email, 
      userType: userData.userType,
      isMaster: userData.isMaster 
    } : null,
    isDeveloper,
    isOwner,
    isDeveloperOrOwner,
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
    // Desenvolvedor, Proprietário ou Admin podem gerenciar usuários
    return isDeveloperOrOwner || isAdmin()
  }

  const canManageSettings = () => {
    // Desenvolvedor, Proprietário ou Admin podem gerenciar configurações
    return isDeveloperOrOwner || isAdmin()
  }

  const canManageProjects = () => {
    // Apenas Desenvolvedor ou Proprietário podem gerenciar projetos
    return isDeveloperOrOwner
  }

  const canManageProjectMembers = () => {
    // Apenas Desenvolvedor ou Proprietário podem gerenciar membros
    return isDeveloperOrOwner
  }

  // Permissão para excluir deals e companies
  const canDeleteDealsAndCompanies = () => {
    // Desenvolvedor e Proprietário sempre podem excluir
    if (isDeveloperOrOwner) return true
    // Outros: apenas owner e admin do projeto
    const role = projectUser?.role
    return role === 'owner' || role === 'admin'
  }

  // Permissão para acessar relatórios de clientes
  // Desenvolvedor e Proprietário têm acesso total
  const canAccessClientReports = () => {
    return isDeveloperOrOwner
  }

  // Permissão para gerenciar integrações de clientes
  // Desenvolvedor e Proprietário têm acesso total
  const canManageClientIntegrations = () => {
    return isDeveloperOrOwner
  }

  return {
    isAdmin: isAdmin(),
    isUser: isUser(),
    isMaster, // Mantido para compatibilidade
    isDeveloper,
    isOwner,
    isDeveloperOrOwner,
    canManageUsers: canManageUsers(),
    canManageSettings: canManageSettings(),
    canManageProjects: canManageProjects(),
    canManageProjectMembers: canManageProjectMembers(),
    canDeleteDealsAndCompanies: canDeleteDealsAndCompanies(),
    canAccessClientReports: canAccessClientReports(),
    canManageClientIntegrations: canManageClientIntegrations(),
  }
}

