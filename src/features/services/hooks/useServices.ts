import { useState, useEffect } from 'react'
import { Service } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setServices([])
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Service>('services', constraints)
        setServices(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Service>('services', constraints)
          setServices(data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<Service>('services', [])
          const filtered = allData
            .filter(s => s.projectId === currentProject.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
          setServices(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar serviços')
      console.error('Erro ao buscar serviços:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchServices()
    } else {
      setServices([])
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const createService = async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const serviceData = {
        ...data,
        projectId: currentProject.id,
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

