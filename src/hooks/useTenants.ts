import { useState, useEffect } from 'react'
import { Project, ProjectUser, User } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, getDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { Timestamp } from 'firebase/firestore'

export interface TenantWithUsers extends Project {
  users: (ProjectUser & { userData?: User })[]
}

export const useTenants = () => {
  const [tenants, setTenants] = useState<TenantWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, userData } = useAuth()

  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userData?.isMaster) {
        setError('Apenas usuários master podem gerenciar tenants')
        setTenants([])
        setLoading(false)
        return
      }

      // Buscar todos os projetos
      let allProjects: Project[]
      try {
        allProjects = await getDocuments<Project>('projects', [orderBy('createdAt', 'desc')])
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<Project>('projects', [])
        allProjects = data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        })
      }

      // Buscar todos os ProjectUsers
      let allProjectUsers: ProjectUser[]
      try {
        allProjectUsers = await getDocuments<ProjectUser>('projectUsers', [])
      } catch {
        allProjectUsers = []
      }

      // Buscar dados dos usuários
      const userIds = [...new Set(allProjectUsers.map(pu => pu.userId).filter((id): id is string => !!id))]
      const usersMap = new Map<string, User>()
      
      for (const userId of userIds) {
        try {
          const user = await getDocument<User>('users', userId)
          if (user) {
            usersMap.set(userId, user)
          }
        } catch (err) {
          console.warn(`Erro ao buscar usuário ${userId}:`, err)
        }
      }

      // Agrupar ProjectUsers por projeto e adicionar dados do usuário
      const tenantsWithUsers: TenantWithUsers[] = allProjects.map(project => {
        const projectUsers = allProjectUsers
          .filter(pu => pu.projectId === project.id)
          .map(pu => ({
            ...pu,
            userData: pu.userId ? usersMap.get(pu.userId) : undefined,
          }))
        
        return {
          ...project,
          users: projectUsers,
        }
      })

      setTenants(tenantsWithUsers)
    } catch (err) {
      setError('Erro ao carregar tenants')
      console.error('Erro ao buscar tenants:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && userData) {
      fetchTenants()
    }
  }, [currentUser, userData])

  const addUserToTenant = async (projectId: string, userId: string, role: ProjectUser['role'], accessLevel: ProjectUser['accessLevel']) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      // Verificar se já existe
      const existingProjectUsers = await getDocuments<ProjectUser>('projectUsers', [
        where('projectId', '==', projectId),
        where('userId', '==', userId),
      ])
      
      if (existingProjectUsers.length > 0) {
        // Atualizar existente
        const existing = existingProjectUsers[0]
        await updateDocument<ProjectUser>('projectUsers', existing.id, {
          role,
          accessLevel,
          updatedAt: Timestamp.now(),
        })
      } else {
        // Buscar dados do usuário para preencher nome
        let userName = 'Usuário'
        try {
          const user = await getDocument<User>('users', userId)
          if (user) {
            userName = user.name || user.email || 'Usuário'
          }
        } catch (err) {
          console.warn(`Erro ao buscar usuário ${userId}:`, err)
        }
        
        // Criar novo
        const projectUser: Omit<ProjectUser, 'id' | 'createdAt' | 'updatedAt'> = {
          projectId,
          userId,
          name: userName,
          role,
          accessLevel,
          active: true,
          createdBy: currentUser.uid,
        }
        await createDocument<ProjectUser>('projectUsers', projectUser)
      }
      
      await fetchTenants()
    } catch (err) {
      setError('Erro ao adicionar usuário ao tenant')
      throw err
    }
  }

  const removeUserFromTenant = async (projectUserId: string) => {
    try {
      await deleteDocument('projectUsers', projectUserId)
      await fetchTenants()
    } catch (err) {
      setError('Erro ao remover usuário do tenant')
      throw err
    }
  }

  const updateUserTenantPermissions = async (projectUserId: string, role: ProjectUser['role'], accessLevel: ProjectUser['accessLevel']) => {
    try {
      await updateDocument<ProjectUser>('projectUsers', projectUserId, {
        role,
        accessLevel,
        updatedAt: Timestamp.now(),
      })
      await fetchTenants()
    } catch (err) {
      setError('Erro ao atualizar permissões')
      throw err
    }
  }

  const updateTenant = async (tenantId: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Project>('projects', tenantId, data)
      await fetchTenants()
    } catch (err) {
      setError('Erro ao atualizar tenant')
      throw err
    }
  }

  return {
    tenants,
    loading,
    error,
    addUserToTenant,
    removeUserFromTenant,
    updateUserTenantPermissions,
    updateTenant,
    refetch: fetchTenants,
  }
}

