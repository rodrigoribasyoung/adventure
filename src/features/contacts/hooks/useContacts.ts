import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDocuments<Contact>('contacts', [orderBy('createdAt', 'desc')])
      setContacts(data)
    } catch (err) {
      setError('Erro ao carregar contatos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchContacts()
    }
  }, [currentUser])

  const createContact = async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      
      const contactData = {
        ...data,
        createdBy: currentUser.uid,
      }
      const id = await createDocument<Contact>('contacts', contactData)
      await fetchContacts()
      return id
    } catch (err) {
      setError('Erro ao criar contato')
      throw err
    }
  }

  const updateContact = async (id: string, data: Partial<Omit<Contact, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await updateDocument<Contact>('contacts', id, data)
      await fetchContacts()
    } catch (err) {
      setError('Erro ao atualizar contato')
      throw err
    }
  }

  const deleteContact = async (id: string) => {
    try {
      await deleteDocument('contacts', id)
      await fetchContacts()
    } catch (err) {
      setError('Erro ao deletar contato')
      throw err
    }
  }

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  }
}

