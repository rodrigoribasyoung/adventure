import { useState, useEffect } from 'react'
import { Automation } from '../types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchAutomations = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const data = await getDocuments<Automation>('automations', [orderBy('createdAt', 'desc')])
        setAutomations(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<Automation>('automations', [])
        setAutomations(data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        }))
      }
    } catch (err) {
      setError('Erro ao carregar automações')
      console.error('Erro ao buscar automações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchAutomations()
    }
  }, [currentUser])

  const createAutomation = async (data: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const automationData = {
        ...data,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Automation>('automations', automationData)
      await fetchAutomations()
      return id
    } catch (err) {
      setError('Erro ao criar automação')
      throw err
    }
  }

  const updateAutomation = async (id: string, data: Partial<Omit<Automation, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Automation>('automations', id, data)
      await fetchAutomations()
    } catch (err) {
      setError('Erro ao atualizar automação')
      throw err
    }
  }

  const deleteAutomation = async (id: string) => {
    try {
      await deleteDocument('automations', id)
      await fetchAutomations()
    } catch (err) {
      setError('Erro ao deletar automação')
      throw err
    }
  }

  const toggleAutomation = async (id: string) => {
    try {
      const automation = automations.find(a => a.id === id)
      if (!automation) return
      await updateDocument<Automation>('automations', id, { enabled: !automation.enabled })
      await fetchAutomations()
    } catch (err) {
      setError('Erro ao alterar status da automação')
      throw err
    }
  }

  return {
    automations,
    loading,
    error,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    refetch: fetchAutomations,
  }
}

