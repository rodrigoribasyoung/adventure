import { useState, useEffect } from 'react'
import { SalesReport } from '../types'
import { getDocuments, createDocument, updateDocument, deleteDocument, where, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useSalesReports = (projectId?: string) => {
  const [reports, setReports] = useState<SalesReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentUser || !projectId) {
        setReports([])
        setLoading(false)
        return
      }

      const constraints = [
        where('projectId', '==', projectId),
        orderBy('date', 'desc')
      ]

      try {
        const data = await getDocuments<SalesReport>('salesReports', constraints)
        setReports(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const data = await getDocuments<SalesReport>('salesReports', [
            where('projectId', '==', projectId)
          ])
          setReports(data.sort((a, b) => {
            const aTime = a.date?.toMillis() || 0
            const bTime = b.date?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<SalesReport>('salesReports', [])
          const filtered = allData
            .filter(r => r.projectId === projectId)
            .sort((a, b) => {
              const aTime = a.date?.toMillis() || 0
              const bTime = b.date?.toMillis() || 0
              return bTime - aTime
            })
          setReports(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar relatórios de vendas')
      console.error('Erro ao buscar relatórios de vendas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && projectId) {
      fetchReports()
    } else {
      setReports([])
      setLoading(false)
    }
  }, [currentUser, projectId])

  const createReport = async (data: Omit<SalesReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!projectId) throw new Error('Nenhum projeto especificado')
      
      const reportData = {
        ...data,
        projectId,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<SalesReport>('salesReports', reportData)
      await fetchReports()
      return id
    } catch (err) {
      setError('Erro ao criar relatório de vendas')
      throw err
    }
  }

  const updateReport = async (id: string, data: Partial<Omit<SalesReport, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<SalesReport>('salesReports', id, data)
      await fetchReports()
    } catch (err) {
      setError('Erro ao atualizar relatório de vendas')
      throw err
    }
  }

  const deleteReport = async (id: string) => {
    try {
      await deleteDocument('salesReports', id)
      await fetchReports()
    } catch (err) {
      setError('Erro ao deletar relatório de vendas')
      throw err
    }
  }

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    refetch: fetchReports,
  }
}
