import { useState, useEffect } from 'react'
import { ProjectUser, ProjectMember, User } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { useUsers } from '@/features/users/hooks/useUsers'

// Tipo unificado para representar um responsável (pode vir de ProjectUser ou ProjectMember)
export interface ProjectResponsible {
  id: string
  projectId: string
  // Dados do usuário (se houver userId)
  userId?: string
  userData?: User
  // Dados do responsável
  name: string
  email?: string
  phone?: string
  jobTitle?: string
  functionLevel?: string
  active: boolean
  // Campos de acesso (apenas para ProjectUser)
  role?: 'owner' | 'admin' | 'user' | 'viewer'
  accessLevel?: 'full' | 'limited'
  // Metadados
  createdAt: any
  updatedAt: any
  createdBy: string
  // Flag para identificar origem
  source: 'projectUser' | 'projectMember'
}

export const useProjectUsers = () => {
  const [responsibles, setResponsibles] = useState<ProjectResponsible[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject, loading: projectLoading } = useProject()
  const { users } = useUsers()

  const fetchResponsibles = async () => {
    if (!currentUser || !currentProject) {
      setResponsibles([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar ProjectUsers do projeto
      let projectUsers: ProjectUser[] = []
      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        projectUsers = await getDocuments<ProjectUser>('projectUsers', constraints)
      } catch (err) {
        console.warn('Erro ao buscar ProjectUsers:', err)
        // Tentar sem orderBy
        try {
          projectUsers = await getDocuments<ProjectUser>('projectUsers', [
            where('projectId', '==', currentProject.id)
          ])
        } catch (err2) {
          console.warn('Erro ao buscar ProjectUsers sem orderBy:', err2)
        }
      }

      // Buscar ProjectMembers do projeto (compatibilidade durante migração)
      let projectMembers: ProjectMember[] = []
      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        projectMembers = await getDocuments<ProjectMember>('projectMembers', constraints)
      } catch (err) {
        console.warn('Erro ao buscar ProjectMembers:', err)
        // Tentar sem orderBy
        try {
          projectMembers = await getDocuments<ProjectMember>('projectMembers', [
            where('projectId', '==', currentProject.id)
          ])
        } catch (err2) {
          console.warn('Erro ao buscar ProjectMembers sem orderBy:', err2)
        }
      }

      // Criar mapa de usuários para lookup rápido
      const usersMap = new Map<string, User>()
      users.forEach(user => {
        usersMap.set(user.id, user)
      })

      // Converter ProjectUsers para ProjectResponsible
      const responsiblesFromUsers: ProjectResponsible[] = projectUsers
        .filter(pu => (pu.active ?? true) !== false) // Filtrar apenas ativos
        .map(pu => {
          const userData = pu.userId ? usersMap.get(pu.userId) : undefined
          return {
            id: pu.id,
            projectId: pu.projectId,
            userId: pu.userId,
            userData,
            name: pu.name || userData?.name || 'Sem nome',
            email: pu.email || userData?.email,
            phone: pu.phone,
            jobTitle: pu.jobTitle,
            functionLevel: pu.functionLevel,
            active: pu.active ?? true,
            role: pu.role,
            accessLevel: pu.accessLevel,
            createdAt: pu.createdAt,
            updatedAt: pu.updatedAt,
            createdBy: pu.createdBy,
            source: 'projectUser' as const,
          }
        })

      // Converter ProjectMembers para ProjectResponsible (compatibilidade)
      const responsiblesFromMembers: ProjectResponsible[] = projectMembers
        .filter(pm => pm.active)
        .map(pm => ({
          id: pm.id,
          projectId: pm.projectId,
          userId: undefined,
          userData: undefined,
          name: pm.name,
          email: pm.email,
          phone: pm.phone,
          jobTitle: pm.role,
          functionLevel: pm.functionLevel,
          active: pm.active,
          role: undefined,
          accessLevel: undefined,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
          createdBy: pm.createdBy,
          source: 'projectMember' as const,
        }))

      // Combinar e ordenar por nome
      const allResponsibles = [...responsiblesFromUsers, ...responsiblesFromMembers]
        .sort((a, b) => a.name.localeCompare(b.name))

      setResponsibles(allResponsibles)
    } catch (err: any) {
      setError('Erro ao carregar responsáveis')
      console.error('Erro ao buscar responsáveis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectLoading) return
    
    if (currentUser && currentProject) {
      fetchResponsibles()
    } else if (!currentProject) {
      setResponsibles([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, currentProject, projectLoading])
  
  // Atualizar quando users mudarem (após carregamento inicial)
  useEffect(() => {
    if (!projectLoading && currentUser && currentProject && users.length > 0) {
      fetchResponsibles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length])

  const createResponsible = async (data: {
    name: string
    email?: string
    phone?: string
    jobTitle?: string
    functionLevel?: string
    active?: boolean
    userId?: string
    role?: 'owner' | 'admin' | 'user' | 'viewer'
    accessLevel?: 'full' | 'limited'
  }) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')

      // Se tiver userId, criar como ProjectUser
      if (data.userId) {
        // Buscar dados do usuário para preencher nome se não fornecido
        const userData = users.find(u => u.id === data.userId)
        const projectUserData: Omit<ProjectUser, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'> = {
          userId: data.userId,
          name: data.name || userData?.name || 'Sem nome',
          email: data.email || userData?.email,
          phone: data.phone,
          jobTitle: data.jobTitle,
          functionLevel: data.functionLevel,
          active: data.active ?? true,
          role: data.role || 'user',
          accessLevel: data.accessLevel || 'full',
        }
        const fullData = {
          ...projectUserData,
          projectId: currentProject.id,
          createdBy: currentUser.uid,
        }
        const id = await createDocument<ProjectUser>('projectUsers', fullData)
        await fetchResponsibles()
        return id
      } else {
        // Se não tiver userId, criar como ProjectMember (compatibilidade)
        const memberData: Omit<ProjectMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'> = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.jobTitle,
          functionLevel: data.functionLevel,
          active: data.active ?? true,
        }
        const fullData = {
          ...memberData,
          projectId: currentProject.id,
          createdBy: currentUser.uid,
        }
        const id = await createDocument<ProjectMember>('projectMembers', fullData)
        await fetchResponsibles()
        return id
      }
    } catch (err) {
      setError('Erro ao criar responsável')
      throw err
    }
  }

  const updateResponsible = async (id: string, data: Partial<{
    name: string
    email?: string
    phone?: string
    jobTitle?: string
    functionLevel?: string
    active?: boolean
    role?: 'owner' | 'admin' | 'user' | 'viewer'
    accessLevel?: 'full' | 'limited'
  }>) => {
    try {
      // Encontrar o responsável para saber a origem
      const responsible = responsibles.find(r => r.id === id)
      if (!responsible) throw new Error('Responsável não encontrado')

      if (responsible.source === 'projectUser') {
        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.email !== undefined) updateData.email = data.email
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle
        if (data.functionLevel !== undefined) updateData.functionLevel = data.functionLevel
        if (data.active !== undefined) updateData.active = data.active
        if (data.role !== undefined) updateData.role = data.role
        if (data.accessLevel !== undefined) updateData.accessLevel = data.accessLevel

        await updateDocument<ProjectUser>('projectUsers', id, updateData)
      } else {
        // ProjectMember
        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.email !== undefined) updateData.email = data.email
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.jobTitle !== undefined) updateData.role = data.jobTitle
        if (data.functionLevel !== undefined) updateData.functionLevel = data.functionLevel
        if (data.active !== undefined) updateData.active = data.active

        await updateDocument<ProjectMember>('projectMembers', id, updateData)
      }

      await fetchResponsibles()
    } catch (err) {
      setError('Erro ao atualizar responsável')
      throw err
    }
  }

  const deleteResponsible = async (id: string) => {
    try {
      // Encontrar o responsável para saber a origem
      const responsible = responsibles.find(r => r.id === id)
      if (!responsible) throw new Error('Responsável não encontrado')

      if (responsible.source === 'projectUser') {
        await deleteDocument('projectUsers', id)
      } else {
        await deleteDocument('projectMembers', id)
      }

      await fetchResponsibles()
    } catch (err) {
      setError('Erro ao deletar responsável')
      throw err
    }
  }

  // Retornar também como "members" para compatibilidade com código existente
  const members = responsibles.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.jobTitle,
    functionLevel: r.functionLevel,
    active: r.active,
  })) as any[]

  return {
    responsibles,
    members, // Compatibilidade
    loading,
    error,
    createResponsible,
    createMember: createResponsible, // Compatibilidade
    updateResponsible,
    updateMember: updateResponsible, // Compatibilidade
    deleteResponsible,
    deleteMember: deleteResponsible, // Compatibilidade
    refetch: fetchResponsibles,
  }
}

