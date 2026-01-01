import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where, Timestamp } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setDeals([])
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Deal>('deals', constraints)
        setDeals(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Deal>('deals', constraints)
          setDeals(data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          // Fallback: buscar todos e filtrar no cliente
          const allData = await getDocuments<Deal>('deals', [])
          const filtered = allData
            .filter(d => d.projectId === currentProject.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
          setDeals(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar negociações')
      console.error('Erro ao buscar negociações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchDeals()
    } else {
      setDeals([])
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const createDeal = async (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      // Validar se há responsável atribuído
      if (!data.assignedTo || data.assignedTo.trim() === '') {
        throw new Error('É obrigatório atribuir um responsável à negociação.')
      }
      
      const dealData = {
        ...data,
        projectId: currentProject.id,
        currency: 'BRL' as const,
        status: 'active' as const, // Todas as negociações começam como "Em andamento"
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Deal>('deals', dealData)
      await fetchDeals()
      return id
    } catch (err) {
      setError('Erro ao criar negociação')
      throw err
    }
  }

  const updateDeal = async (id: string, data: Partial<Omit<Deal, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Deal>('deals', id, data)
      await fetchDeals()
    } catch (err) {
      setError('Erro ao atualizar negociação')
      throw err
    }
  }

  const deleteDeal = async (id: string) => {
    try {
      await deleteDocument('deals', id)
      await fetchDeals()
    } catch (err) {
      setError('Erro ao deletar negociação')
      throw err
    }
  }

  const updateDealStage = async (id: string, stage: string) => {
    try {
      await updateDocument<Deal>('deals', id, { stage })
      await fetchDeals()
    } catch (err) {
      setError('Erro ao atualizar estágio da negociação')
      throw err
    }
  }

  const closeDeal = async (id: string, status: 'won' | 'lost', closeReason?: string) => {
    try {
      const updateData: any = {
        status: status === 'won' ? 'won' : 'lost',
        closedAt: Timestamp.now(),
      }
      if (closeReason) {
        updateData.closeReason = closeReason
      }
      await updateDocument<Deal>('deals', id, updateData)
      await fetchDeals()
    } catch (err) {
      setError('Erro ao fechar negociação')
      throw err
    }
  }

  const reopenDeal = async (id: string) => {
    try {
      await updateDocument<Deal>('deals', id, {
        status: 'active',
        closeReason: undefined,
        closedAt: undefined,
      })
      await fetchDeals()
    } catch (err) {
      setError('Erro ao reabrir negociação')
      throw err
    }
  }

  const pauseDeal = async (id: string) => {
    try {
      await updateDocument<Deal>('deals', id, { status: 'paused' })
      await fetchDeals()
    } catch (err) {
      setError('Erro ao pausar negociação')
      throw err
    }
  }

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStage,
    closeDeal,
    reopenDeal,
    pauseDeal,
    refetch: fetchDeals,
  }
}

