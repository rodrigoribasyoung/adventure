import { useState, useEffect } from 'react'
import { Funnel } from '@/types'
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useFunnels = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [activeFunnel, setActiveFunnel] = useState<Funnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchFunnels = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const data = await getDocuments<Funnel>('funnels', [orderBy('createdAt', 'desc')])
        setFunnels(data)
        
        // Encontrar funil ativo
        const active = data.find(f => f.active) || data[0] || null
        setActiveFunnel(active)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<Funnel>('funnels', [])
        setFunnels(data)
        const active = data.find(f => f.active) || data[0] || null
        setActiveFunnel(active)
      }
    } catch (err) {
      setError('Erro ao carregar funis')
      console.error('Erro ao buscar funis:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchFunnels()
    }
  }, [currentUser])

  const getFunnelById = async (id: string): Promise<Funnel | null> => {
    try {
      return await getDocument<Funnel>('funnels', id)
    } catch (err) {
      console.error('Erro ao buscar funil:', err)
      return null
    }
  }

  const createFunnel = async (data: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const funnelData = {
        ...data,
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
      await deleteDocument('funnels', id)
      await fetchFunnels()
    } catch (err) {
      setError('Erro ao deletar funil')
      throw err
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

