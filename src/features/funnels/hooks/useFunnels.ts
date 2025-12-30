import { useState, useEffect } from 'react'
import { Funnel, Deal } from '@/types'
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useFunnels = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [activeFunnel, setActiveFunnel] = useState<Funnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchFunnels = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setFunnels([])
        setActiveFunnel(null)
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Funnel>('funnels', constraints)
        setFunnels(data)
        
        // Encontrar funil ativo
        const active = data.find(f => f.active) || data[0] || null
        setActiveFunnel(active)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Funnel>('funnels', constraints)
          setFunnels(data)
          const active = data.find(f => f.active) || data[0] || null
          setActiveFunnel(active)
        } catch (whereError) {
          const allData = await getDocuments<Funnel>('funnels', [])
          const filtered = allData.filter(f => f.projectId === currentProject.id)
          setFunnels(filtered)
          const active = filtered.find(f => f.active) || filtered[0] || null
          setActiveFunnel(active)
        }
      }
    } catch (err) {
      setError('Erro ao carregar funis')
      console.error('Erro ao buscar funis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchFunnels()
    } else {
      setFunnels([])
      setActiveFunnel(null)
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const getFunnelById = async (id: string): Promise<Funnel | null> => {
    try {
      return await getDocument<Funnel>('funnels', id)
    } catch (err) {
      console.error('Erro ao buscar funil:', err)
      return null
    }
  }

  const createFunnel = async (data: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const funnelData = {
        ...data,
        projectId: currentProject.id,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Funnel>('funnels', funnelData)
      await fetchFunnels()
      return id
    } catch (err) {
      setError('Erro ao criar funil')
      throw err
    }
  }

  const updateFunnel = async (id: string, data: Partial<Omit<Funnel, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Funnel>('funnels', id, data)
      await fetchFunnels()
    } catch (err) {
      setError('Erro ao atualizar funil')
      throw err
    }
  }

  const deleteFunnel = async (id: string) => {
    try {
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      // Buscar o funil para obter os IDs dos estágios
      const funnel = await getDocument<Funnel>('funnels', id)
      if (!funnel) throw new Error('Funil não encontrado')
      
      // Buscar negociações que usam algum estágio deste funil
      const stageIds = funnel.stages.map(s => s.id)
      const deals = await getDocuments<Deal>('deals', [
        where('projectId', '==', currentProject.id)
      ])
      
      const dealsUsingFunnel = deals.filter(deal => stageIds.includes(deal.stage))
      
      if (dealsUsingFunnel.length > 0) {
        throw new Error(`Não é possível excluir este funil. Existem ${dealsUsingFunnel.length} negociação(ões) associadas a ele.`)
      }
      
      await deleteDocument('funnels', id)
      await fetchFunnels()
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao deletar funil'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    funnels,
    activeFunnel,
    loading,
    error,
    getFunnelById,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    refetch: fetchFunnels,
  }
}

