import { useState, useEffect } from 'react'
import { CustomField } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useCustomFields = (entityType?: 'contact' | 'company' | 'deal') => {
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchCustomFields = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const data = await getDocuments<CustomField>('customFields', [orderBy('createdAt', 'desc')])
        // Filtrar por tipo de entidade se fornecido
        const filtered = entityType ? data.filter(field => field.entityType === entityType) : data
        setCustomFields(filtered)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<CustomField>('customFields', [])
        const filtered = entityType ? data.filter(field => field.entityType === entityType) : data
        setCustomFields(filtered.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        }))
      }
    } catch (err) {
      setError('Erro ao carregar campos personalizados')
      console.error('Erro ao buscar campos personalizados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchCustomFields()
    }
  }, [currentUser, entityType])

  const createCustomField = async (data: Omit<CustomField, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const customFieldData = {
        ...data,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<CustomField>('customFields', customFieldData)
      await fetchCustomFields()
      return id
    } catch (err) {
      setError('Erro ao criar campo personalizado')
      throw err
    }
  }

  const updateCustomField = async (id: string, data: Partial<Omit<CustomField, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<CustomField>('customFields', id, data)
      await fetchCustomFields()
    } catch (err) {
      setError('Erro ao atualizar campo personalizado')
      throw err
    }
  }

  const deleteCustomField = async (id: string) => {
    try {
      await deleteDocument('customFields', id)
      await fetchCustomFields()
    } catch (err) {
      setError('Erro ao deletar campo personalizado')
      throw err
    }
  }

  return {
    customFields,
    loading,
    error,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    refetch: fetchCustomFields,
  }
}

