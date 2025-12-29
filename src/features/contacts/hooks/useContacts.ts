import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { getDocuments, createDocument, updateDocument, deleteDocument, orderBy, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentProject) {
        setContacts([])
        setLoading(false)
        return
      }

      try {
        const constraints = [
          where('projectId', '==', currentProject.id),
          orderBy('createdAt', 'desc')
        ]
        const data = await getDocuments<Contact>('contacts', constraints)
        setContacts(data)
      } catch (orderByError) {
        console.warn('orderBy não disponível, buscando sem ordenação:', orderByError)
        try {
          const constraints = [where('projectId', '==', currentProject.id)]
          const data = await getDocuments<Contact>('contacts', constraints)
          setContacts(data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0
            const bTime = b.createdAt?.toMillis() || 0
            return bTime - aTime
          }))
        } catch (whereError) {
          const allData = await getDocuments<Contact>('contacts', [])
          const filtered = allData
            .filter(c => c.projectId === currentProject.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis() || 0
              const bTime = b.createdAt?.toMillis() || 0
              return bTime - aTime
            })
          setContacts(filtered)
        }
      }
    } catch (err) {
      setError('Erro ao carregar contatos')
      console.error('Erro ao buscar contatos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchContacts()
    } else {
      setContacts([])
      setLoading(false)
    }
  }, [currentUser, currentProject])

  const createContact = async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId' | 'name'>) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      // Gerar nome completo se não fornecido
      const name = data.name || `${data.firstName} ${data.lastName || ''}`.trim()
      
      const contactData = {
        ...data,
        name,
        projectId: currentProject.id,
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

