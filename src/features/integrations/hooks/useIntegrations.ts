import { useState, useEffect } from 'react'
import { IntegrationConnection, IntegrationProvider } from '../types'
import { getDocuments, createDocument, updateDocument, deleteDocument, where, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useIntegrations = (provider?: IntegrationProvider) => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchConnections = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentUser) return

      const constraints: any[] = [where('userId', '==', currentUser.uid), orderBy('connectedAt', 'desc')]
      
      if (provider) {
        constraints.push(where('provider', '==', provider))
      }

      try {
        const data = await getDocuments<IntegrationConnection>('integrations', constraints)
        setConnections(data)
      } catch (err: any) {
        // Se orderBy falhar, tenta sem ordenação
        console.warn('orderBy não disponível, buscando sem ordenação:', err)
        const filterConstraints = constraints.filter(c => c.type === 'where')
        const data = await getDocuments<IntegrationConnection>('integrations', filterConstraints)
        setConnections(data.sort((a, b) => {
          const aTime = a.connectedAt?.toMillis() || 0
          const bTime = b.connectedAt?.toMillis() || 0
          return bTime - aTime
        }))
      }
    } catch (err) {
      setError('Erro ao carregar conexões')
      console.error('Erro ao buscar conexões:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchConnections()
    }
  }, [currentUser, provider])

  const createConnection = async (data: Omit<IntegrationConnection, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const connectionData = {
        ...data,
        userId: currentUser.uid,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<IntegrationConnection>('integrations', connectionData)
      await fetchConnections()
      return id
    } catch (err) {
      setError('Erro ao criar conexão')
      throw err
    }
  }

  const updateConnection = async (id: string, data: Partial<Omit<IntegrationConnection, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<IntegrationConnection>('integrations', id, data)
      await fetchConnections()
    } catch (err) {
      setError('Erro ao atualizar conexão')
      throw err
    }
  }

  const deleteConnection = async (id: string) => {
    try {
      await deleteDocument('integrations', id)
      await fetchConnections()
    } catch (err) {
      setError('Erro ao deletar conexão')
      throw err
    }
  }

  return {
    connections,
    loading,
    error,
    createConnection,
    updateConnection,
    deleteConnection,
    refetch: fetchConnections,
  }
}

