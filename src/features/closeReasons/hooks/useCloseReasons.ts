import { useState, useEffect } from 'react'
import { CloseReason } from '@/types'
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useCloseReasons = () => {
  const [closeReasons, setCloseReasons] = useState<CloseReason[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchCloseReasons = async (type?: 'won' | 'lost') => {
    try {
      setLoading(true)
      setError(null)
      
      const constraints: any[] = [where('active', '==', true)]
      if (type) {
        constraints.push(where('type', '==', type))
      }

      try {
        const data = await getDocuments<CloseReason>('closeReasons', constraints)
        // Ordenar por ordem ou nome
        const sorted = data.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          return a.name.localeCompare(b.name)
        })
        setCloseReasons(sorted)
      } catch (orderByError) {
        console.warn('Erro ao buscar motivos de fechamento:', orderByError)
        const data = await getDocuments<CloseReason>('closeReasons', [where('active', '==', true)])
        setCloseReasons(data.sort((a, b) => a.name.localeCompare(b.name)))
      }
    } catch (err) {
      setError('Erro ao carregar motivos de fechamento')
      console.error('Erro ao buscar motivos de fechamento:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchCloseReasons()
    }
  }, [currentUser])

  const getCloseReasonById = async (id: string): Promise<CloseReason | null> => {
    try {
      return await getDocument<CloseReason>('closeReasons', id)
    } catch (err) {
      console.error('Erro ao buscar motivo de fechamento:', err)
      return null
    }
  }

  const getCloseReasonsByType = async (type: 'won' | 'lost'): Promise<CloseReason[]> => {
    await fetchCloseReasons(type)
    return closeReasons.filter(r => r.type === type)
  }

  const createCloseReason = async (data: Omit<CloseReason, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const reasonData = {
        ...data,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<CloseReason>('closeReasons', reasonData)
      await fetchCloseReasons()
      return id
    } catch (err) {
      setError('Erro ao criar motivo de fechamento')
      throw err
    }
  }

  const updateCloseReason = async (id: string, data: Partial<Omit<CloseReason, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<CloseReason>('closeReasons', id, data)
      await fetchCloseReasons()
    } catch (err) {
      setError('Erro ao atualizar motivo de fechamento')
      throw err
    }
  }

  const deleteCloseReason = async (id: string) => {
    try {
      await deleteDocument('closeReasons', id)
      await fetchCloseReasons()
    } catch (err) {
      setError('Erro ao deletar motivo de fechamento')
      throw err
    }
  }

  return {
    closeReasons,
    loading,
    error,
    getCloseReasonById,
    getCloseReasonsByType,
    createCloseReason,
    updateCloseReason,
    deleteCloseReason,
    refetch: fetchCloseReasons,
  }
}

