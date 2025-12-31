import { useState, useEffect } from 'react'
import { MarketingReport } from '../types'
import { getDocuments, createDocument, updateDocument, deleteDocument, where, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useMarketingReports = (projectId?: string) => {
  const [reports, setReports] = useState<MarketingReport[]>([])
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
        const data = await getDocuments<MarketingReport>('marketingReports', constraints)
        setReports(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const data = await getDocuments<MarketingReport>('marketingReports', [
            where('projectId', '==', projectId)
          ])
          setReports(data.sort((a, b) => {
            const aTime = a.date?.toMillis() || 0
            const bTime = b.date?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<MarketingReport>('marketingReports', [])
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
      setError('Erro ao carregar relatórios de marketing')
      console.error('Erro ao buscar relatórios de marketing:', err)
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

  const createReport = async (data: Omit<MarketingReport, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!projectId) throw new Error('Nenhum projeto especificado')
      
      const reportData = {
        ...data,
        projectId,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<MarketingReport>('marketingReports', reportData)
      await fetchReports()
      return id
    } catch (err) {
      setError('Erro ao criar relatório de marketing')
      throw err
    }
  }

  const updateReport = async (id: string, data: Partial<Omit<MarketingReport, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<MarketingReport>('marketingReports', id, data)
      await fetchReports()
    } catch (err) {
      setError('Erro ao atualizar relatório de marketing')
      throw err
    }
  }

  const deleteReport = async (id: string) => {
    try {
      await deleteDocument('marketingReports', id)
      await fetchReports()
    } catch (err) {
      setError('Erro ao deletar relatório de marketing')
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
