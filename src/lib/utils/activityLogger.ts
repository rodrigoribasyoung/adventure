import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'closed' 
  | 'reopened'
  | 'stage_changed'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'

export type EntityType = 'deal' | 'contact' | 'company' | 'task' | 'proposal' | 'service' | 'funnel' | 'user' | 'project'

interface LogActivityParams {
  action: ActivityAction
  entityType: EntityType
  entityId: string
  entityName: string
  details?: Record<string, any>
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    // Obter contexto atual (pode ser chamado fora de componentes React)
    const projectId = (window as any).__currentProjectId
    const userId = (window as any).__currentUserId
    const userName = (window as any).__currentUserName

    if (!projectId || !userId) {
      console.warn('[ActivityLogger] Contexto não disponível, atividade não registrada')
      return
    }

    const activityData = {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      userId,
      userName: userName || 'Usuário',
      projectId,
      details: params.details || {},
      createdAt: Timestamp.now(),
    }

    await addDoc(collection(db, 'activityHistory'), activityData)
  } catch (error) {
    console.error('[ActivityLogger] Erro ao registrar atividade:', error)
  }
}

// Helper para inicializar contexto (chamado no App.tsx ou similar)
export const initActivityLogger = (projectId: string, userId: string, userName: string) => {
  (window as any).__currentProjectId = projectId
  ;(window as any).__currentUserId = userId
  ;(window as any).__currentUserName = userName
}

