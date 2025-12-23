import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const data = await getDocuments<Deal>('deals', [orderBy('createdAt', 'desc')])
        setDeals(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<Deal>('deals', [])
        setDeals(data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        }))
      }
    } catch (err) {
      setError('Erro ao carregar negociações')
      console.error('Erro ao buscar negociações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchDeals()
    }
  }, [currentUser])

  const createDeal = async (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const dealData = {
        ...data,
        currency: 'BRL' as const,
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

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStage,
    refetch: fetchDeals,
  }
}

