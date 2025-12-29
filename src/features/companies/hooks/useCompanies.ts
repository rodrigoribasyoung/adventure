import { useState, useEffect } from 'react'
import { Company } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setCompanies([])
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Company>('companies', constraints)
        setCompanies(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Company>('companies', constraints)
          setCompanies(data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<Company>('companies', [])
          const filtered = allData
            .filter(c => c.projectId === currentProject.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
          setCompanies(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar empresas')
      console.error('Erro ao buscar empresas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchCompanies()
    } else {
      setCompanies([])
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const createCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const companyData = {
        ...data,
        projectId: currentProject.id,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Company>('companies', companyData)
      await fetchCompanies()
      return id
    } catch (err) {
      setError('Erro ao criar empresa')
      throw err
    }
  }

  const updateCompany = async (id: string, data: Partial<Omit<Company, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Company>('companies', id, data)
      await fetchCompanies()
    } catch (err) {
      setError('Erro ao atualizar empresa')
      throw err
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      await deleteDocument('companies', id)
      await fetchCompanies()
    } catch (err) {
      setError('Erro ao deletar empresa')
      throw err
    }
  }

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies,
  }
}

