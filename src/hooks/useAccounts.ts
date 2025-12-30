import { useState, useEffect } from 'react'
import { Account } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser, userData } = useAuth()

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      let allAccounts: Account[]
      
      try {
        allAccounts = await getDocuments<Account>('accounts', [orderBy('createdAt', 'desc')])
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        const data = await getDocuments<Account>('accounts', [])
        allAccounts = data.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0
          const bTime = b.createdAt?.toMillis() || 0
          return bTime - aTime
        })
      }

      // Se for master, retorna todas as contas
      if (userData?.isMaster) {
        setAccounts(allAccounts)
        return
      }

      // Se não for master, não tem acesso a contas (apenas master pode gerenciar)
      setAccounts([])
    } catch (err) {
      setError('Erro ao carregar contas')
      console.error('Erro ao buscar contas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchAccounts()
    }
  }, [currentUser, userData])

  const createAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'ownerId'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!userData?.isMaster) throw new Error('Apenas usuários master podem criar contas')
      
      const accountData = {
        ...data,
        ownerId: currentUser.uid,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Account>('accounts', accountData)
      
      await fetchAccounts()
      return id
    } catch (err) {
      setError('Erro ao criar conta')
      throw err
    }
  }

  const updateAccount = async (id: string, data: Partial<Omit<Account, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      if (!userData?.isMaster) throw new Error('Apenas usuários master podem atualizar contas')
      await updateDocument<Account>('accounts', id, data)
      await fetchAccounts()
    } catch (err) {
      setError('Erro ao atualizar conta')
      throw err
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      if (!userData?.isMaster) throw new Error('Apenas usuários master podem deletar contas')
      await deleteDocument('accounts', id)
      await fetchAccounts()
    } catch (err) {
      setError('Erro ao deletar conta')
      throw err
    }
  }

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  }
}

