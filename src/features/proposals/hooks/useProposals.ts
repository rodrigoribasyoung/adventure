import { useState, useEffect } from 'react'
import { Proposal } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchProposals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setProposals([])
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Proposal>('proposals', constraints)
        setProposals(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Proposal>('proposals', constraints)
          setProposals(data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<Proposal>('proposals', [])
          const filtered = allData
            .filter(p => p.projectId === currentProject.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
          setProposals(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar propostas')
      console.error('Erro ao buscar propostas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchProposals()
    } else {
      setProposals([])
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const createProposal = async (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const proposalData = {
        ...data,
        projectId: currentProject.id,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Proposal>('proposals', proposalData)
      await fetchProposals()
      return id
    } catch (err) {
      setError('Erro ao criar proposta')
      throw err
    }
  }

  const updateProposal = async (id: string, data: Partial<Omit<Proposal, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Proposal>('proposals', id, data)
      await fetchProposals()
    } catch (err) {
      setError('Erro ao atualizar proposta')
      throw err
    }
  }

  const deleteProposal = async (id: string) => {
    try {
      await deleteDocument('proposals', id)
      await fetchProposals()
    } catch (err) {
      setError('Erro ao deletar proposta')
      throw err
    }
  }

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    refetch: fetchProposals,
  }
}

