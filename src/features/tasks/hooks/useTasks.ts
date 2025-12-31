import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useTasks = (dealId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setTasks([])
        setLoading(false)
        return
      }
      
      let data: Task[]
      
      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        data = await getDocuments<Task>('tasks', constraints)
        
        if (dealId) {
          data = data.filter(task => task.dealId === dealId)
        }
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          data = await getDocuments<Task>('tasks', constraints)
          
          if (dealId) {
            data = data.filter(task => task.dealId === dealId)
          }
          
          data = data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          })
        } catch (whereError) {
          const allTasks = await getDocuments<Task>('tasks', [])
          data = allTasks
            .filter(task => task.projectId === currentProject.id && (!dealId || task.dealId === dealId))
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
        }
      }
      
      setTasks(data)
    } catch (err) {
      setError('Erro ao carregar tarefas')
      console.error('Erro ao buscar tarefas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [currentUser, currentProject, dealId])

  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        projectId: currentProject.id,
        status: data.status || 'pending',
        createdBy: currentUser.uid,
        // Garantir que dealId seja incluído apenas se fornecido
        dealId: data.dealId || undefined,
      }
      const id = await createDocument<Task>('tasks', taskData)
      await fetchTasks()
      return id
    } catch (err) {
      setError('Erro ao criar tarefa')
      console.error('[useTasks] Erro ao criar tarefa:', err)
      throw err
    }
  }

  const updateTask = async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Task>('tasks', id, data)
      await fetchTasks()
    } catch (err) {
      setError('Erro ao atualizar tarefa')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteDocument('tasks', id)
      await fetchTasks()
    } catch (err) {
      setError('Erro ao deletar tarefa')
      throw err
    }
  }

  const toggleTaskStatus = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id)
      if (!task) return
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      await updateDocument<Task>('tasks', id, { status: newStatus })
      await fetchTasks()
    } catch (err) {
      setError('Erro ao atualizar status da tarefa')
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    refetch: fetchTasks,
  }
}

