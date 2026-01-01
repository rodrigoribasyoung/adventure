import { useState, useEffect } from 'react'
import { Project, ProjectUser } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, userData } = useAuth()

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

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

      // Se for master, retorna todos os projetos
      if (userData?.isMaster) {
        setProjects(allProjects)
        return
      }

      // Se não for master, buscar apenas projetos onde o usuário tem acesso
      if (!currentUser) {
        setProjects([])
        return
      }

      // Buscar ProjectUsers do usuário atual
      let projectUsers: ProjectUser[]
      try {
        projectUsers = await getDocuments<ProjectUser>('projectUsers', [])
      } catch {
        projectUsers = []
      }

      const userProjectIds = projectUsers
        .filter(pu => pu.userId === currentUser.uid)
        .map(pu => pu.projectId)

      // Filtrar projetos acessíveis
      const accessibleProjects = allProjects.filter(p => 
        userProjectIds.includes(p.id) && p.active
      )

      setProjects(accessibleProjects)
    } catch (err) {
      setError('Erro ao carregar projetos')
      console.error('Erro ao buscar projetos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchProjects()
    }
  }, [currentUser, userData])

  const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'ownerId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const projectData = {
        ...data,
        ownerId: currentUser.uid,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Project>('projects', projectData)
      
      // Criar ProjectUser para o owner
      const projectUser: Omit<ProjectUser, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: id,
        userId: currentUser.uid,
        name: currentUser.displayName || currentUser.email || 'Usuário',
        role: 'owner',
        accessLevel: 'full',
        active: true,
        createdBy: currentUser.uid,
      }
      await createDocument<ProjectUser>('projectUsers', projectUser)
      
      await fetchProjects()
      return id
    } catch (err) {
      setError('Erro ao criar projeto')
      throw err
    }
  }

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Project>('projects', id, data)
      await fetchProjects()
    } catch (err) {
      setError('Erro ao atualizar projeto')
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await deleteDocument('projects', id)
      await fetchProjects()
    } catch (err) {
      setError('Erro ao deletar projeto')
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  }
}

