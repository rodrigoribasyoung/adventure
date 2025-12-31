import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from '@/features/integrations/components/OAuthButton'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { useProject } from '@/contexts/ProjectContext'
import { exchangeCodeForToken } from '../oauth'
import { prepareConnectionForStorage } from '@/lib/integrations/storage'
import { Timestamp } from 'firebase/firestore'
import { META_ADS_OAUTH_CONFIG } from '../oauth'

interface MetaAdsConnectionProps {
  onConnected?: () => void
}

export const MetaAdsConnection = ({ onConnected }: MetaAdsConnectionProps) => {
  const { connections, createConnection, deleteConnection } = useIntegrations('meta_ads')
  const { currentProject } = useProject()

  const connection = connections[0]

  const handleConnect = async (code: string) => {
    try {
      
      // Trocar código por token
      const tokenData = await exchangeCodeForToken(code)
      
      // Buscar informações da conta (simplificado - em produção, buscar dados reais)
      const accountId = 'me' // Simplificado - em produção, buscar accountId real
      const accountName = 'Minha Conta Meta Ads' // Simplificado
      
      // Criar conexão
      if (!currentProject) {
        throw new Error('Nenhum projeto selecionado')
      }

      const connectionData = prepareConnectionForStorage({
        provider: 'meta_ads',
        accessToken: tokenData.access_token,
        refreshToken: undefined, // Meta Ads não usa refresh token da mesma forma
        expiresAt: tokenData.expires_in 
          ? Timestamp.fromMillis(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        connectedAt: Timestamp.now(),
        accountId,
        accountName,
        userId: '', // Será preenchido no hook
        projectId: currentProject.id, // Adicionar projectId
        metadata: {},
      })
      
      await createConnection(connectionData)
      onConnected?.()
    } catch (error: any) {
      console.error('Erro ao conectar Meta Ads:', error)
      throw error
    }
  }

  const handleDisconnect = async () => {
    if (connection) {
      await deleteConnection(connection.id)
    }
  }

  if (connection) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Conectado</h3>
              <p className="text-sm text-white/70 mt-1">{connection.accountName}</p>
            </div>
            <Button variant="ghost" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!currentProject) {
    return (
      <Card>
        <div className="p-4">
          <h3 className="font-medium text-white mb-2">Conectar Meta Ads</h3>
          <p className="text-sm text-white/70 mb-4">
            Selecione um projeto antes de conectar uma integração. Esta integração ficará vinculada ao projeto selecionado.
          </p>
        </div>
      </Card>
    )
  }

  // Verificar se o clientId está configurado
  if (!META_ADS_OAUTH_CONFIG.clientId || META_ADS_OAUTH_CONFIG.clientId.trim() === '') {
    return (
      <Card>
        <div className="p-4">
          <h3 className="font-medium text-white mb-2">Conectar Meta Ads</h3>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-200 font-medium mb-2">Configuração necessária</p>
            <p className="text-xs text-yellow-200/80">
              A variável de ambiente <code className="bg-white/10 px-1 rounded">VITE_META_ADS_CLIENT_ID</code> não está configurada.
            </p>
            <p className="text-xs text-yellow-200/80 mt-2">
              Para conectar o Meta Ads, você precisa criar um app no Facebook Developers e adicionar a variável no arquivo .env
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="font-medium text-white mb-2">Conectar Meta Ads</h3>
        <p className="text-sm text-white/70 mb-4">
          Conecte sua conta do Facebook Ads para analisar campanhas e métricas. Esta integração será vinculada ao projeto <strong className="text-white">{currentProject.name}</strong>.
        </p>
        <OAuthButton
          provider="meta_ads"
          clientId={META_ADS_OAUTH_CONFIG.clientId}
          redirectUri={META_ADS_OAUTH_CONFIG.redirectUri}
          scope={META_ADS_OAUTH_CONFIG.scope}
          authUrl={META_ADS_OAUTH_CONFIG.authUrl}
          onSuccess={handleConnect}
          onError={(error) => console.error('Erro ao conectar:', error)}
        >
          Conectar Meta Ads
        </OAuthButton>
      </div>
    </Card>
  )
}

