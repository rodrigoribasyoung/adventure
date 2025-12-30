import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'

export interface ActivityHistory {
  id: string
  action: string
  entityType: 'deal' | 'contact' | 'company' | 'task' | 'proposal' | 'service' | 'funnel' | 'user' | 'project'
  entityId: string
  entityName: string
  userId: string
  userName: string
  projectId: string
  details?: Record<string, any>
  createdAt: Timestamp
}

export const useActivityHistory = (maxItems: number = 100) => {
  const { currentProject } = useProject()
  const { currentUser } = useAuth()
  const [history, setHistory] = useState<ActivityHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentProject || !currentUser) {
      setHistory([])
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        setLoading(true)
        const historyRef = collection(db, 'activityHistory')
        const q = query(
          historyRef,
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc'),
          limit(maxItems)
        )
        
        const snapshot = await getDocs(q)
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ActivityHistory[]
        
        setHistory(historyData)
      } catch (error) {
        console.error('[ActivityHistory] Erro ao buscar histórico:', error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [currentProject, currentUser, maxItems])

  return { history, loading }
}

