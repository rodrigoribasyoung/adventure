import { useState, useEffect } from 'react'
import { ProjectMember } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useProjectMembers = () => {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject, loading } = useProject()

  const fetchMembers = async () => {
    if (!currentUser || !currentProject) {
      setMembers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const constraints = [
        where('projectId', '==', currentProject.id),
        orderBy('createdAt', 'desc')
      ]
      const data = await getDocuments<ProjectMember>('projectMembers', constraints)
      setMembers(data)
    } catch (err: any) {
      setError('Erro ao carregar responsáveis')
      console.error('Erro ao buscar responsáveis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return // Aguardar carregamento do projeto
    
    if (currentUser && currentProject) {
      fetchMembers()
    } else if (!currentProject) {
      setMembers([])
      setLoading(false)
    }
  }, [currentUser, currentProject, loading])

  const createMember = async (data: Omit<ProjectMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')

      const memberData = {
        ...data,
        projectId: currentProject.id,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<ProjectMember>('projectMembers', memberData)
      await fetchMembers()
      return id
    } catch (err) {
      setError('Erro ao criar responsável')
      throw err
    }
  }

  const updateMember = async (id: string, data: Partial<Omit<ProjectMember, 'id' | 'createdAt' | 'createdBy' | 'projectId'>>) => {
    try {
      await updateDocument<ProjectMember>('projectMembers', id, data)
      await fetchMembers()
    } catch (err) {
      setError('Erro ao atualizar responsável')
      throw err
    }
  }

  const deleteMember = async (id: string) => {
    try {
      await deleteDocument('projectMembers', id)
      await fetchMembers()
    } catch (err) {
      setError('Erro ao deletar responsável')
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    createMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  }
}

