import { useState, useEffect } from 'react'
import { Service } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDocuments<Service>('services', [orderBy('createdAt', 'desc')])
      setServices(data)
    } catch (err) {
      setError('Erro ao carregar serviços')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchServices()
    }
  }, [currentUser])

  const createService = async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const serviceData = {
        ...data,
        currency: 'BRL' as const,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Service>('services', serviceData)
      await fetchServices()
      return id
    } catch (err) {
      setError('Erro ao criar serviço')
      throw err
    }
  }

  const updateService = async (id: string, data: Partial<Omit<Service, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Service>('services', id, data)
      await fetchServices()
    } catch (err) {
      setError('Erro ao atualizar serviço')
      throw err
    }
  }

  const deleteService = async (id: string) => {
    try {
      await deleteDocument('services', id)
      await fetchServices()
    } catch (err) {
      setError('Erro ao deletar serviço')
      throw err
    }
  }

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch: fetchServices,
  }
}

