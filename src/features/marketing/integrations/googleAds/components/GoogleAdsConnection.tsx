import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from '@/features/integrations/components/OAuthButton'
import { useIntegrations } from '@/features/integrations/hooks/useIntegrations'
import { useProject } from '@/contexts/ProjectContext'
import { exchangeCodeForToken, GOOGLE_ADS_OAUTH_CONFIG } from '../oauth'
import { prepareConnectionForStorage } from '@/lib/integrations/storage'
import { Timestamp } from 'firebase/firestore'

interface GoogleAdsConnectionProps {
  onConnected?: () => void
  onError?: (error: string) => void
}

export const GoogleAdsConnection = ({ onConnected, onError }: GoogleAdsConnectionProps) => {
  const { connections, createConnection, deleteConnection } = useIntegrations('google_ads')
  const { currentProject } = useProject()

  const connection = connections[0]

  const handleConnect = async (code: string) => {
    try {
      
      // Trocar código por token
      const tokenData = await exchangeCodeForToken(code)
      
      // Buscar informações da conta (simplificado - em produção, buscar dados reais)
      const accountId = 'me' // Simplificado - em produção, buscar accountId real
      const accountName = 'Minha Conta Google Ads' // Simplificado
      
      // Criar conexão
      const connectionData = prepareConnectionForStorage({
        provider: 'google_ads',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in 
          ? Timestamp.fromMillis(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        connectedAt: Timestamp.now(),
        accountId,
        accountName,
        userId: '', // Será preenchido no hook
        metadata: {},
      })
      
      await createConnection(connectionData)
      onConnected?.()
    } catch (error: any) {
      console.error('Erro ao conectar Google Ads:', error)
      throw error
    }
  }

  const handleDisconnect = async () => {
    if (connection) {
      try {
        await deleteConnection(connection.id)
      } catch (error: any) {
        console.error('Erro ao desconectar Google Ads:', error)
        throw error
      }
    }
  }

  if (connection) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Google Ads Conectado</h3>
              <p className="text-sm text-white/70">{connection.accountName}</p>
            </div>
            <Button variant="ghost" onClick={handleDisconnect}>
              Desconectar
            </Button>
          </div>
          <p className="text-sm text-white/60">
            Conectado em {connection.connectedAt.toDate().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </Card>
    )
  }

  if (!currentProject) {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Google Ads</h3>
            <p className="text-sm text-white/70">
              Selecione um projeto antes de conectar uma integração. Esta integração ficará vinculada ao projeto selecionado.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // Verificar se o clientId está configurado
  if (!GOOGLE_ADS_OAUTH_CONFIG.clientId || GOOGLE_ADS_OAUTH_CONFIG.clientId.trim() === '') {
    return (
      <Card>
        <div className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Google Ads</h3>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-200 font-medium mb-2">Configuração necessária</p>
              <p className="text-xs text-yellow-200/80">
                A variável de ambiente <code className="bg-white/10 px-1 rounded">VITE_GOOGLE_ADS_CLIENT_ID</code> não está configurada.
              </p>
              <p className="text-xs text-yellow-200/80 mt-2">
                Para conectar o Google Ads, você precisa:
              </p>
              <ol className="text-xs text-yellow-200/80 mt-2 list-decimal list-inside space-y-1">
                <li>Criar um projeto no Google Cloud Console</li>
                <li>Habilitar a Google Ads API</li>
                <li>Criar credenciais OAuth 2.0</li>
                <li>Adicionar a variável <code className="bg-white/10 px-1 rounded">VITE_GOOGLE_ADS_CLIENT_ID</code> no arquivo .env</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white mb-1">Google Ads</h3>
          <p className="text-sm text-white/70">
            Conecte sua conta do Google Ads para acompanhar performance de campanhas. Esta integração será vinculada ao projeto <strong className="text-white">{currentProject.name}</strong>.
          </p>
        </div>
        <OAuthButton
          provider="google_ads"
          clientId={GOOGLE_ADS_OAUTH_CONFIG.clientId}
          redirectUri={GOOGLE_ADS_OAUTH_CONFIG.redirectUri}
          scope={GOOGLE_ADS_OAUTH_CONFIG.scope}
          authUrl={GOOGLE_ADS_OAUTH_CONFIG.authUrl}
          onSuccess={handleConnect}
          onError={(error) => {
            console.error('Erro ao conectar Google Ads:', error)
            onError?.(error)
          }}
          className="w-full"
        >
          Conectar Google Ads
        </OAuthButton>
      </div>
    </Card>
  )
}

