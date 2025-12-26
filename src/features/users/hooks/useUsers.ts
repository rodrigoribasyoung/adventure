import { useState, useEffect } from 'react'
import { User } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      try {
        const data = await getDocuments<User>('users', [orderBy('createdAt', 'desc')])
        setUsers(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<User>('users', [])
        setUsers(data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        }))
      }
    } catch (err) {
      setError('Erro ao carregar usuários')
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  const createUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const userData = {
        ...data,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<User>('users', userData)
      await fetchUsers()
      return id
    } catch (err) {
      setError('Erro ao criar usuário')
      throw err
    }
  }

  const updateUser = async (id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<User>('users', id, data)
      await fetchUsers()
    } catch (err) {
      setError('Erro ao atualizar usuário')
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await deleteDocument('users', id)
      await fetchUsers()
    } catch (err) {
      setError('Erro ao deletar usuário')
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  }
}

