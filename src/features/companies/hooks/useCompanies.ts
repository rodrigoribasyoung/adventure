import { useState, useEffect } from 'react'
import { Company } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDocuments<Company>('companies', [orderBy('createdAt', 'desc')])
      setCompanies(data)
    } catch (err) {
      setError('Erro ao carregar empresas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchCompanies()
    }
  }, [currentUser])

  const createCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const companyData = {
        ...data,
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

