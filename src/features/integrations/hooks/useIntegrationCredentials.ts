import { useState, useEffect } from 'react'
import { getDocuments, createDocument, updateDocument, deleteDocument, where } from '@/lib/firebase/db'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import { ClientIntegration } from '@/features/clientReports/types'
// Não usar prepareConnectionForStorage para credenciais - elas são diferentes de tokens

export interface OAuthCredentials {
  clientId: string
  clientSecret: string
}

export const useIntegrationCredentials = (provider: 'meta_ads' | 'google_ads' | 'google_analytics') => {
  const [credentials, setCredentials] = useState<OAuthCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const { currentProject } = useProject()

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentUser || !currentProject) {
        setCredentials(null)
        setLoading(false)
        return
      }

      const constraints = [
        where('projectId', '==', currentProject.id),
        where('provider', '==', provider),
      ]

      const data = await getDocuments<ClientIntegration>('clientIntegrations', constraints)
      
      if (data.length > 0 && data[0].credentials) {
        const creds = data[0].credentials as any
        // Em produção, descriptografar se creds.encrypted === true
        if (creds.clientId && creds.clientSecret) {
          setCredentials({
            clientId: creds.clientId,
            clientSecret: creds.clientSecret,
          })
        } else {
          setCredentials(null)
        }
      } else {
        setCredentials(null)
      }
    } catch (err) {
      setError('Erro ao carregar credenciais')
      console.error('Erro ao buscar credenciais:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser && currentProject) {
      fetchCredentials()
    } else {
      setCredentials(null)
      setLoading(false)
    }
  }, [currentUser, currentProject, provider])

  const saveCredentials = async (creds: OAuthCredentials) => {
    try {
      if (!currentUser) throw new Error('Usuário não autenticado')
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      setError(null)

      const constraints = [
        where('projectId', '==', currentProject.id),
        where('provider', '==', provider),
      ]

      const existing = await getDocuments<ClientIntegration>('clientIntegrations', constraints)
      
      // Salvar credenciais (em produção, devem ser criptografadas)
      const credentialsData = {
        encrypted: false, // Em produção, usar true e criptografar
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
      }

      if (existing.length > 0) {
        // Atualizar existente
        await updateDocument<ClientIntegration>('clientIntegrations', existing[0].id, {
          credentials: credentialsData,
          syncEnabled: true,
        })
      } else {
        // Criar novo
        await createDocument<ClientIntegration>('clientIntegrations', {
          projectId: currentProject.id,
          provider,
          config: {},
          credentials: credentialsData,
          syncEnabled: true,
          createdBy: currentUser.uid,
        })
      }

      await fetchCredentials()
    } catch (err) {
      setError('Erro ao salvar credenciais')
      throw err
    }
  }

  const deleteCredentials = async () => {
    try {
      if (!currentProject) throw new Error('Nenhum projeto selecionado')
      
      const constraints = [
        where('projectId', '==', currentProject.id),
        where('provider', '==', provider),
      ]

      const existing = await getDocuments<ClientIntegration>('clientIntegrations', constraints)
      
      if (existing.length > 0) {
        await deleteDocument('clientIntegrations', existing[0].id)
        await fetchCredentials()
      }
    } catch (err) {
      setError('Erro ao deletar credenciais')
      throw err
    }
  }

  return {
    credentials,
    loading,
    error,
    saveCredentials,
    deleteCredentials,
    refetch: fetchCredentials,
  }
}
